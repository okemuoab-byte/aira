from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from auth import get_current_user
from models import User
from database import get_database
from services.simple_openai_service import get_simple_openai_service

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    context: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime
    conversation_id: str
    model_used: str
    disclaimer: str

class ConversationHistory(BaseModel):
    conversation_id: str
    messages: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    chat_message: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Chat with AI assistant for general health questions and platform guidance.
    The AI can answer questions about health topics, platform features, and provide general assistance.
    """
    try:
        user_id = ObjectId(current_user["_id"])
        
        # Get user's recent health data for context
        recent_symptoms = await db.symptoms.find({
            "user_id": user_id,
            "timestamp": {"$gte": datetime.utcnow().replace(day=1)},  # This month
            "deleted_at": {"$exists": False}
        }).limit(10).to_list(length=None)
        
        medications = await db.medications.find({
            "user_id": user_id,
            "$or": [
                {"end_date": {"$exists": False}},
                {"end_date": {"$gte": datetime.utcnow()}}
            ]
        }).limit(5).to_list(length=None)
        
        # Build context-aware prompt
        system_prompt = build_chatbot_system_prompt(current_user, recent_symptoms, medications)
        user_prompt = chat_message.message
        
        # Add additional context if provided
        if chat_message.context:
            user_prompt += f"\n\nAdditional context: {chat_message.context}"
        
        # Get AI response
        openai_service = get_simple_openai_service()
        
        # Use the existing service but with custom prompts
        data = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],
            "max_tokens": 800,
            "temperature": 0.7
        }
        
        response = await openai_service._make_request("chat/completions", data)
        ai_response = response["choices"][0]["message"]["content"]
        
        # Generate conversation ID (simple timestamp-based for now)
        conversation_id = f"chat_{user_id}_{int(datetime.utcnow().timestamp())}"
        
        # Store conversation in database
        conversation_data = {
            "conversation_id": conversation_id,
            "user_id": user_id,
            "messages": [
                {
                    "role": "user",
                    "content": user_prompt,
                    "timestamp": datetime.utcnow()
                },
                {
                    "role": "assistant",
                    "content": ai_response,
                    "timestamp": datetime.utcnow()
                }
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.chat_conversations.insert_one(conversation_data)
        
        return ChatResponse(
            response=ai_response,
            timestamp=datetime.utcnow(),
            conversation_id=conversation_id,
            model_used="gpt-3.5-turbo",
            disclaimer="This AI assistant provides general information and guidance. For medical concerns, always consult with healthcare professionals."
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process chat message: {str(e)}")

@router.post("/chat/continue/{conversation_id}", response_model=ChatResponse)
async def continue_conversation(
    conversation_id: str,
    chat_message: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Continue an existing conversation with the AI assistant.
    """
    try:
        user_id = ObjectId(current_user["_id"])
        
        # Get existing conversation
        conversation = await db.chat_conversations.find_one({
            "conversation_id": conversation_id,
            "user_id": user_id
        })
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Get recent health data for context
        recent_symptoms = await db.symptoms.find({
            "user_id": user_id,
            "timestamp": {"$gte": datetime.utcnow().replace(day=1)},
            "deleted_at": {"$exists": False}
        }).limit(10).to_list(length=None)
        
        medications = await db.medications.find({
            "user_id": user_id,
            "$or": [
                {"end_date": {"$exists": False}},
                {"end_date": {"$gte": datetime.utcnow()}}
            ]
        }).limit(5).to_list(length=None)
        
        # Build conversation history for context
        messages = [
            {
                "role": "system",
                "content": build_chatbot_system_prompt(current_user, recent_symptoms, medications)
            }
        ]
        
        # Add previous conversation messages (limit to last 10 for context)
        for msg in conversation["messages"][-10:]:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        # Add new user message
        user_prompt = chat_message.message
        if chat_message.context:
            user_prompt += f"\n\nAdditional context: {chat_message.context}"
            
        messages.append({
            "role": "user",
            "content": user_prompt
        })
        
        # Get AI response
        openai_service = get_simple_openai_service()
        
        data = {
            "model": "gpt-3.5-turbo",
            "messages": messages,
            "max_tokens": 800,
            "temperature": 0.7
        }
        
        response = await openai_service._make_request("chat/completions", data)
        ai_response = response["choices"][0]["message"]["content"]
        
        # Update conversation in database
        await db.chat_conversations.update_one(
            {"conversation_id": conversation_id, "user_id": user_id},
            {
                "$push": {
                    "messages": {
                        "$each": [
                            {
                                "role": "user",
                                "content": user_prompt,
                                "timestamp": datetime.utcnow()
                            },
                            {
                                "role": "assistant",
                                "content": ai_response,
                                "timestamp": datetime.utcnow()
                            }
                        ]
                    }
                },
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return ChatResponse(
            response=ai_response,
            timestamp=datetime.utcnow(),
            conversation_id=conversation_id,
            model_used="gpt-3.5-turbo",
            disclaimer="This AI assistant provides general information and guidance. For medical concerns, always consult with healthcare professionals."
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to continue conversation: {str(e)}")

@router.get("/chat/history")
async def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    limit: int = 10
):
    """
    Get user's chat conversation history.
    """
    try:
        user_id = ObjectId(current_user["_id"])
        
        conversations = await db.chat_conversations.find({
            "user_id": user_id
        }).sort("updated_at", -1).limit(limit).to_list(length=None)
        
        # Format conversations for response
        formatted_conversations = []
        for conv in conversations:
            # Get the first user message as preview
            first_user_msg = next((msg for msg in conv["messages"] if msg["role"] == "user"), None)
            preview = first_user_msg["content"][:100] + "..." if first_user_msg and len(first_user_msg["content"]) > 100 else first_user_msg["content"] if first_user_msg else "No messages"
            
            formatted_conversations.append({
                "conversation_id": conv["conversation_id"],
                "preview": preview,
                "message_count": len(conv["messages"]),
                "created_at": conv["created_at"],
                "updated_at": conv["updated_at"]
            })
        
        return {
            "conversations": formatted_conversations,
            "total": len(formatted_conversations)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get chat history: {str(e)}")

@router.get("/chat/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get a specific conversation by ID.
    """
    try:
        user_id = ObjectId(current_user["_id"])
        
        conversation = await db.chat_conversations.find_one({
            "conversation_id": conversation_id,
            "user_id": user_id
        })
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return {
            "conversation_id": conversation["conversation_id"],
            "messages": conversation["messages"],
            "created_at": conversation["created_at"],
            "updated_at": conversation["updated_at"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get conversation: {str(e)}")

def build_chatbot_system_prompt(user: Dict[str, Any], recent_symptoms: List[Dict], medications: List[Dict]) -> str:
    """
    Build a comprehensive system prompt for the chatbot with user context.
    """
    base_prompt = """You are a helpful AI assistant for the Health Journey Platform, a comprehensive health tracking application. You can help users with:

1. General health information and education (always emphasize consulting healthcare professionals)
2. Platform features and how to use them
3. Understanding their health data and patterns
4. General wellness and lifestyle advice
5. Answering questions about symptoms, medications, and health tracking

IMPORTANT GUIDELINES:
- Never provide specific medical diagnoses or treatment recommendations
- Always encourage users to consult healthcare professionals for medical concerns
- Be empathetic and supportive
- Provide accurate, evidence-based health information
- Help users understand how to use the platform effectively
- If asked about serious symptoms or emergencies, advise immediate medical attention

PLATFORM FEATURES YOU CAN HELP WITH:
- Symptom logging and tracking
- Medication management and reminders
- Health insights and analytics
- Body map for symptom location
- Healthcare visit tracking
- Family health sharing
- Photo documentation
- Voice recording for symptoms
- Health trends and patterns"""

    # Add user context
    user_context = f"\n\nUSER CONTEXT:\n- User: {user.get('name', 'User')}"
    
    if recent_symptoms:
        symptom_types = list(set([s.get('type', 'Unknown') for s in recent_symptoms]))
        user_context += f"\n- Recent symptoms tracked: {', '.join(symptom_types[:5])}"
        user_context += f"\n- Total symptoms this month: {len(recent_symptoms)}"
    
    if medications:
        med_names = [m.get('name', 'Unknown medication') for m in medications[:3]]
        user_context += f"\n- Current medications: {', '.join(med_names)}"
    
    user_context += "\n\nUse this context to provide more personalized and relevant responses, but always maintain medical disclaimers."
    
    return base_prompt + user_context