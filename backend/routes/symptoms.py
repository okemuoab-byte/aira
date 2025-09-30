from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from auth import get_current_user
from models import User, SymptomCreate, SymptomUpdate, Symptom, SymptomInDB
from database import get_database, create_symptom, get_symptoms, update_symptom, delete_symptom

router = APIRouter()


@router.post("/")
async def create_symptom_endpoint(
    symptom: SymptomCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new symptom entry"""
    try:
        # Use MongoDB CRUD function to create symptom
        created_symptom = await create_symptom(current_user["_id"], symptom.model_dump())
        return created_symptom
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create symptom: {str(e)}")


@router.get("/")
async def get_symptoms_endpoint(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    start_date: Optional[datetime] = Query(None, description="Filter symptoms from this date"),
    end_date: Optional[datetime] = Query(None, description="Filter symptoms until this date"),
    body_part: Optional[str] = Query(None, description="Filter by body part"),
    limit: int = Query(100, le=1000, description="Maximum number of symptoms to return")
):
    """Get user's symptom history with optional filtering"""
    try:
        # Build filters for MongoDB CRUD function
        filters = {}
        
        # Add date filtering
        if start_date or end_date:
            date_filter = {}
            if start_date:
                date_filter["$gte"] = start_date
            if end_date:
                date_filter["$lte"] = end_date
            filters["timestamp"] = date_filter
        
        # Add body part filtering
        if body_part:
            filters["body_part_id"] = body_part
        
        # Use MongoDB CRUD function to get symptoms
        symptoms = await get_symptoms(current_user["_id"], filters, limit)
        return symptoms
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve symptoms: {str(e)}")


@router.get("/{symptom_id}")
async def get_symptom(
    symptom_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific symptom by ID"""
    if not ObjectId.is_valid(symptom_id):
        raise HTTPException(status_code=400, detail="Invalid symptom ID")
    
    try:
        # Use MongoDB CRUD function to get symptoms with filter by ID
        symptoms = await get_symptoms(current_user["_id"], {"_id": ObjectId(symptom_id)}, 1)
        
        if not symptoms:
            raise HTTPException(status_code=404, detail="Symptom not found")
        
        return symptoms[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve symptom: {str(e)}")


@router.put("/{symptom_id}")
async def update_symptom_endpoint(
    symptom_id: str,
    symptom_update: SymptomUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update a symptom entry (24-hour window)"""
    if not ObjectId.is_valid(symptom_id):
        raise HTTPException(status_code=400, detail="Invalid symptom ID")
    
    try:
        # Check if symptom exists and belongs to user
        existing_symptoms = await get_symptoms(current_user["_id"], {"_id": ObjectId(symptom_id)}, 1)
        
        if not existing_symptoms:
            raise HTTPException(status_code=404, detail="Symptom not found")
        
        existing_symptom = existing_symptoms[0]
        
        # Check 24-hour edit window
        created_at = existing_symptom.get("created_at")
        if created_at:
            # Parse ISO string back to datetime if needed
            if isinstance(created_at, str):
                created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            if datetime.utcnow() - created_at > timedelta(hours=24):
                raise HTTPException(
                    status_code=403,
                    detail="Symptom can only be edited within 24 hours of creation"
                )
        
        # Prepare update data
        update_data = {k: v for k, v in symptom_update.model_dump().items() if v is not None}
        
        # Use MongoDB CRUD function to update symptom
        success = await update_symptom(symptom_id, current_user["_id"], update_data)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update symptom")
        
        # Return updated symptom
        updated_symptoms = await get_symptoms(current_user["_id"], {"_id": ObjectId(symptom_id)}, 1)
        return updated_symptoms[0] if updated_symptoms else None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update symptom: {str(e)}")


@router.delete("/{symptom_id}")
async def delete_symptom_endpoint(
    symptom_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Soft delete a symptom entry"""
    if not ObjectId.is_valid(symptom_id):
        raise HTTPException(status_code=400, detail="Invalid symptom ID")
    
    try:
        # Check if symptom exists and belongs to user
        existing_symptoms = await get_symptoms(current_user["_id"], {"_id": ObjectId(symptom_id)}, 1)
        
        if not existing_symptoms:
            raise HTTPException(status_code=404, detail="Symptom not found")
        
        # Use MongoDB CRUD function to soft delete symptom
        success = await delete_symptom(symptom_id, current_user["_id"])
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete symptom")
        
        return {"message": "Symptom deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete symptom: {str(e)}")


@router.get("/body-parts/definitions")
async def get_body_parts():
    """Get body part definitions for the interactive body map"""
    # This would typically come from a database or configuration file
    # For now, returning a basic structure that matches the frontend expectations
    body_parts = {
        "head": {
            "id": "head",
            "name": "Head",
            "regions": ["forehead", "temples", "scalp", "face"]
        },
        "neck": {
            "id": "neck",
            "name": "Neck",
            "regions": ["front", "back", "sides"]
        },
        "chest": {
            "id": "chest",
            "name": "Chest",
            "regions": ["upper", "lower", "left", "right"]
        },
        "abdomen": {
            "id": "abdomen",
            "name": "Abdomen",
            "regions": ["upper", "lower", "left", "right"]
        },
        "back": {
            "id": "back",
            "name": "Back",
            "regions": ["upper", "middle", "lower"]
        },
        "left-arm": {
            "id": "left-arm",
            "name": "Left Arm",
            "regions": ["shoulder", "upper-arm", "elbow", "forearm", "wrist", "hand"]
        },
        "right-arm": {
            "id": "right-arm",
            "name": "Right Arm",
            "regions": ["shoulder", "upper-arm", "elbow", "forearm", "wrist", "hand"]
        },
        "left-leg": {
            "id": "left-leg",
            "name": "Left Leg",
            "regions": ["hip", "thigh", "knee", "calf", "ankle", "foot"]
        },
        "right-leg": {
            "id": "right-leg",
            "name": "Right Leg",
            "regions": ["hip", "thigh", "knee", "calf", "ankle", "foot"]
        }
    }
    
    return {"body_parts": body_parts}


@router.get("/systemic/categories")
async def get_systemic_categories():
    """Get systemic symptom categories"""
    categories = {
        "general": {
            "name": "General Health",
            "symptoms": [
                "fatigue", "fever", "chills", "night_sweats", "weight_loss", 
                "weight_gain", "appetite_loss", "appetite_increase"
            ]
        },
        "mood": {
            "name": "Mood & Mental Health",
            "symptoms": [
                "anxiety", "depression", "mood_swings", "irritability", 
                "confusion", "memory_issues", "concentration_problems"
            ]
        },
        "sleep": {
            "name": "Sleep",
            "symptoms": [
                "insomnia", "excessive_sleepiness", "sleep_disruption", 
                "nightmares", "restless_sleep"
            ]
        },
        "digestive": {
            "name": "Digestive System",
            "symptoms": [
                "nausea", "vomiting", "diarrhea", "constipation", 
                "bloating", "heartburn", "loss_of_appetite"
            ]
        },
        "respiratory": {
            "name": "Respiratory",
            "symptoms": [
                "shortness_of_breath", "cough", "wheezing", 
                "chest_tightness", "sinus_congestion"
            ]
        },
        "cardiovascular": {
            "name": "Heart & Circulation",
            "symptoms": [
                "palpitations", "chest_pain", "dizziness", 
                "fainting", "swelling", "cold_extremities"
            ]
        }
    }
    
    return {"categories": categories}