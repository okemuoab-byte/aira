from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from auth import get_current_user
from models import User
from database import get_database
from services.enhanced_clinical_ai_service import get_enhanced_clinical_ai_service

router = APIRouter()

class ClinicalAssessmentRequest(BaseModel):
    symptoms: List[Dict[str, Any]]
    patient_profile: Dict[str, Any]
    medical_history: Optional[List[str]] = None
    current_medications: Optional[List[str]] = None

class SymptomSummaryRequest(BaseModel):
    timeframe: str = "recent"  # recent, weekly, monthly
    body_part_filter: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class ActionPlanRequest(BaseModel):
    assessment_id: str
    patient_preferences: Optional[Dict[str, Any]] = None

@router.post("/comprehensive-assessment")
async def create_comprehensive_assessment(
    request: ClinicalAssessmentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Generate comprehensive AI clinical assessment with results, summary, and next steps"""
    try:
        ai_service = get_enhanced_clinical_ai_service()
        
        # Generate comprehensive assessment
        assessment_result = await ai_service.comprehensive_clinical_assessment(
            symptoms=request.symptoms,
            patient_profile=request.patient_profile,
            medical_history=request.medical_history,
            current_medications=request.current_medications
        )
        
        if not assessment_result.get("success"):
            raise HTTPException(
                status_code=500, 
                detail=f"AI assessment failed: {assessment_result.get('error', 'Unknown error')}"
            )
        
        assessment_data = assessment_result["assessment"]
        
        # Store assessment in database
        assessment_record = {
            "user_id": ObjectId(current_user["_id"]),
            "assessment_id": assessment_data["assessment_id"],
            "assessment_data": assessment_data,
            "symptoms": request.symptoms,
            "patient_profile": request.patient_profile,
            "medical_history": request.medical_history,
            "current_medications": request.current_medications,
            "created_at": datetime.utcnow(),
            "status": "active"
        }
        
        result = await db.clinical_assessments.insert_one(assessment_record)
        
        # Add database ID to response
        assessment_data["db_id"] = str(result.inserted_id)
        
        return {
            "success": True,
            "assessment": assessment_data,
            "message": "Comprehensive clinical assessment completed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create assessment: {str(e)}")

@router.get("/assessment/{assessment_id}")
async def get_assessment(
    assessment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Retrieve a specific clinical assessment"""
    try:
        assessment = await db.clinical_assessments.find_one({
            "assessment_id": assessment_id,
            "user_id": ObjectId(current_user["_id"])
        })
        
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        # Convert ObjectId to string for JSON serialization
        assessment["_id"] = str(assessment["_id"])
        assessment["user_id"] = str(assessment["user_id"])
        
        return {
            "success": True,
            "assessment": assessment
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve assessment: {str(e)}")

@router.get("/assessments")
async def get_user_assessments(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    limit: int = Query(20, le=100),
    skip: int = Query(0, ge=0)
):
    """Get user's clinical assessments with pagination"""
    try:
        cursor = db.clinical_assessments.find({
            "user_id": ObjectId(current_user["_id"])
        }).sort("created_at", -1).skip(skip).limit(limit)
        
        assessments = await cursor.to_list(length=limit)
        
        # Convert ObjectIds to strings
        for assessment in assessments:
            assessment["_id"] = str(assessment["_id"])
            assessment["user_id"] = str(assessment["user_id"])
        
        return {
            "success": True,
            "assessments": assessments,
            "count": len(assessments)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve assessments: {str(e)}")

@router.post("/symptom-summary")
async def generate_symptom_summary(
    request: SymptomSummaryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Generate AI-powered symptom summary and trends analysis"""
    try:
        # Build query for symptoms
        query = {"user_id": ObjectId(current_user["_id"])}
        
        # Add date filtering
        if request.start_date or request.end_date:
            date_filter = {}
            if request.start_date:
                date_filter["$gte"] = request.start_date
            if request.end_date:
                date_filter["$lte"] = request.end_date
            query["timestamp"] = date_filter
        
        # Add body part filtering
        if request.body_part_filter:
            query["body_part_id"] = request.body_part_filter
        
        # Get symptoms from database
        cursor = db.symptoms.find(query).sort("timestamp", -1).limit(100)
        symptoms = await cursor.to_list(length=100)
        
        if not symptoms:
            return {
                "success": True,
                "summary": {
                    "message": "No symptoms found for the specified criteria",
                    "symptom_count": 0,
                    "timeframe": request.timeframe
                }
            }
        
        # Convert symptoms to format expected by AI service
        symptom_data = []
        for symptom in symptoms:
            symptom_data.append({
                "timestamp": symptom.get("timestamp", "").isoformat() if symptom.get("timestamp") else "",
                "body_part": symptom.get("body_part_name", "Unknown"),
                "type": symptom.get("type", "Unknown"),
                "intensity": symptom.get("intensity", 0),
                "notes": symptom.get("notes", ""),
                "duration": symptom.get("duration", "Unknown")
            })
        
        ai_service = get_enhanced_clinical_ai_service()
        
        # Generate AI summary
        summary_result = await ai_service.generate_symptom_summary(
            symptoms=symptom_data,
            timeframe=request.timeframe
        )
        
        if not summary_result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate summary: {summary_result.get('error', 'Unknown error')}"
            )
        
        # Store summary in database
        summary_record = {
            "user_id": ObjectId(current_user["_id"]),
            "summary_data": summary_result["summary"],
            "timeframe": request.timeframe,
            "symptom_count": len(symptom_data),
            "filters": {
                "body_part_filter": request.body_part_filter,
                "start_date": request.start_date,
                "end_date": request.end_date
            },
            "created_at": datetime.utcnow()
        }
        
        await db.symptom_summaries.insert_one(summary_record)
        
        return {
            "success": True,
            "summary": summary_result["summary"],
            "symptom_count": len(symptom_data),
            "timeframe": request.timeframe
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate symptom summary: {str(e)}")

@router.post("/action-plan")
async def generate_action_plan(
    request: ActionPlanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Generate personalized action plan based on clinical assessment"""
    try:
        # Retrieve the assessment
        assessment = await db.clinical_assessments.find_one({
            "assessment_id": request.assessment_id,
            "user_id": ObjectId(current_user["_id"])
        })
        
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        ai_service = get_enhanced_clinical_ai_service()
        
        # Generate personalized action plan
        action_plan_result = await ai_service.generate_personalized_action_plan(
            assessment=assessment["assessment_data"],
            patient_preferences=request.patient_preferences
        )
        
        if not action_plan_result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate action plan: {action_plan_result.get('error', 'Unknown error')}"
            )
        
        # Store action plan in database
        action_plan_record = {
            "user_id": ObjectId(current_user["_id"]),
            "assessment_id": request.assessment_id,
            "action_plan_data": action_plan_result["action_plan"],
            "patient_preferences": request.patient_preferences,
            "created_at": datetime.utcnow(),
            "status": "active"
        }
        
        result = await db.action_plans.insert_one(action_plan_record)
        
        # Update assessment with action plan reference
        await db.clinical_assessments.update_one(
            {"assessment_id": request.assessment_id},
            {"$set": {"action_plan_id": str(result.inserted_id)}}
        )
        
        return {
            "success": True,
            "action_plan": action_plan_result["action_plan"],
            "action_plan_id": str(result.inserted_id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate action plan: {str(e)}")

@router.get("/action-plan/{action_plan_id}")
async def get_action_plan(
    action_plan_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Retrieve a specific action plan"""
    try:
        if not ObjectId.is_valid(action_plan_id):
            raise HTTPException(status_code=400, detail="Invalid action plan ID")
        
        action_plan = await db.action_plans.find_one({
            "_id": ObjectId(action_plan_id),
            "user_id": ObjectId(current_user["_id"])
        })
        
        if not action_plan:
            raise HTTPException(status_code=404, detail="Action plan not found")
        
        # Convert ObjectId to string
        action_plan["_id"] = str(action_plan["_id"])
        action_plan["user_id"] = str(action_plan["user_id"])
        
        return {
            "success": True,
            "action_plan": action_plan
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve action plan: {str(e)}")

@router.put("/action-plan/{action_plan_id}/progress")
async def update_action_plan_progress(
    action_plan_id: str,
    progress_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update progress on action plan items"""
    try:
        if not ObjectId.is_valid(action_plan_id):
            raise HTTPException(status_code=400, detail="Invalid action plan ID")
        
        # Update action plan with progress
        result = await db.action_plans.update_one(
            {
                "_id": ObjectId(action_plan_id),
                "user_id": ObjectId(current_user["_id"])
            },
            {
                "$set": {
                    "progress": progress_data,
                    "last_updated": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Action plan not found or no changes made")
        
        return {
            "success": True,
            "message": "Action plan progress updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update action plan progress: {str(e)}")

@router.post("/real-time-assessment")
async def start_real_time_assessment(
    symptom_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Start a real-time clinical assessment session"""
    try:
        # Create assessment session
        session_data = {
            "user_id": ObjectId(current_user["_id"]),
            "session_id": f"session_{datetime.utcnow().timestamp()}",
            "initial_symptom": symptom_data,
            "status": "in_progress",
            "created_at": datetime.utcnow(),
            "steps_completed": [],
            "current_step": "initial_assessment"
        }
        
        result = await db.assessment_sessions.insert_one(session_data)
        
        return {
            "success": True,
            "session_id": session_data["session_id"],
            "db_id": str(result.inserted_id),
            "current_step": "initial_assessment",
            "message": "Real-time assessment session started"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start assessment session: {str(e)}")

@router.put("/real-time-assessment/{session_id}")
async def update_assessment_session(
    session_id: str,
    update_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update real-time assessment session with new data"""
    try:
        result = await db.assessment_sessions.update_one(
            {
                "session_id": session_id,
                "user_id": ObjectId(current_user["_id"])
            },
            {
                "$set": {
                    **update_data,
                    "last_updated": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Assessment session not found")
        
        return {
            "success": True,
            "message": "Assessment session updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update assessment session: {str(e)}")

@router.get("/real-time-assessment/{session_id}")
async def get_assessment_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get current state of real-time assessment session"""
    try:
        session = await db.assessment_sessions.find_one({
            "session_id": session_id,
            "user_id": ObjectId(current_user["_id"])
        })
        
        if not session:
            raise HTTPException(status_code=404, detail="Assessment session not found")
        
        # Convert ObjectId to string
        session["_id"] = str(session["_id"])
        session["user_id"] = str(session["user_id"])
        
        return {
            "success": True,
            "session": session
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve assessment session: {str(e)}")