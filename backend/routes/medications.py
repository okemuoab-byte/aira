from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from auth import get_current_user
from models import (
    MedicationCreate, MedicationUpdate, DoseLogCreate,
    MedicationSuggestionRequest, MedicationPurposeResponse,
    MedicationAIAssistRequest, MedicationAIAssistResponse
)
from database import get_database, create_medication, get_medications, update_medication, delete_medication, log_dose
from services.medication_ai_service import get_medication_ai_service

router = APIRouter()

# Initialize AI service
medication_ai_service = get_medication_ai_service()


@router.post("/")
async def create_medication_endpoint(
    medication: MedicationCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new medication"""
    try:
        # Use MongoDB CRUD function to create medication
        created_medication = await create_medication(current_user["_id"], medication.model_dump())
        return created_medication
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create medication: {str(e)}")


@router.get("/")
async def get_medications_endpoint(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    active_only: bool = Query(True, description="Filter to show only active medications"),
    limit: int = Query(100, le=1000, description="Maximum number of medications to return")
):
    """Get user's medications with optional filtering"""
    try:
        # Use MongoDB CRUD function to get medications
        medications = await get_medications(current_user["_id"], active_only, limit)
        return medications
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve medications: {str(e)}")


# Move specific routes before parameterized routes to avoid conflicts
@router.get("/suggestions")
async def get_medication_suggestions(
    query: str = Query(..., description="Partial medication name or description"),
    purpose: Optional[str] = Query(None, description="Optional purpose/condition for the medication"),
    current_user: dict = Depends(get_current_user)
):
    """Get AI-powered medication name suggestions"""
    try:
        # Use AI service to get medication suggestions
        ai_response = await medication_ai_service.suggest_medications(
            partial_name=query,
            purpose=purpose
        )
        
        if ai_response["success"]:
            return {
                "success": True,
                "query": query,
                "purpose": purpose,
                "suggestions": ai_response["suggestions"],
                "disclaimer": ai_response["disclaimer"],
                "ai_generated": True
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate suggestions: {ai_response.get('error', 'Unknown error')}"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating medication suggestions: {str(e)}"
        )


@router.get("/{medication_id}")
async def get_medication(
    medication_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific medication by ID"""
    if not ObjectId.is_valid(medication_id):
        raise HTTPException(status_code=400, detail="Invalid medication ID")
    
    try:
        # Use MongoDB CRUD function to get medications with filter by ID
        medications = await get_medications(current_user["_id"], active_only=False, limit=1)
        
        # Find the specific medication by ID
        medication = next((med for med in medications if med["id"] == medication_id), None)
        
        if not medication:
            raise HTTPException(status_code=404, detail="Medication not found")
        
        return medication
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve medication: {str(e)}")


@router.put("/{medication_id}")
async def update_medication_endpoint(
    medication_id: str,
    medication_update: MedicationUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update a medication"""
    if not ObjectId.is_valid(medication_id):
        raise HTTPException(status_code=400, detail="Invalid medication ID")
    
    try:
        # Check if medication exists and belongs to user
        medications = await get_medications(current_user["_id"], active_only=False, limit=1000)
        existing_medication = next((med for med in medications if med["id"] == medication_id), None)
        
        if not existing_medication:
            raise HTTPException(status_code=404, detail="Medication not found")
        
        # Prepare update data
        update_data = {k: v for k, v in medication_update.model_dump().items() if v is not None}
        
        # Use MongoDB CRUD function to update medication
        success = await update_medication(medication_id, current_user["_id"], update_data)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update medication")
        
        # Return updated medication
        updated_medications = await get_medications(current_user["_id"], active_only=False, limit=1000)
        updated_medication = next((med for med in updated_medications if med["id"] == medication_id), None)
        
        return updated_medication
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update medication: {str(e)}")


@router.delete("/{medication_id}")
async def delete_medication_endpoint(
    medication_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete a medication"""
    if not ObjectId.is_valid(medication_id):
        raise HTTPException(status_code=400, detail="Invalid medication ID")
    
    try:
        # Check if medication exists and belongs to user
        medications = await get_medications(current_user["_id"], active_only=False, limit=1000)
        existing_medication = next((med for med in medications if med["id"] == medication_id), None)
        
        if not existing_medication:
            raise HTTPException(status_code=404, detail="Medication not found")
        
        # Use MongoDB CRUD function to delete medication
        success = await delete_medication(medication_id, current_user["_id"])
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete medication")
        
        return {"message": "Medication deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete medication: {str(e)}")


@router.get("/{medication_id}/safety")
async def get_medication_safety_info(
    medication_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get AI-generated safety information for a medication"""
    if not ObjectId.is_valid(medication_id):
        raise HTTPException(status_code=400, detail="Invalid medication ID")
    
    # Check if medication exists and belongs to user
    medication = await db.medications.find_one({
        "_id": ObjectId(medication_id),
        "user_id": ObjectId(current_user["_id"])
    })
    
    if not medication:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    try:
        # Use AI service to generate safety information
        ai_response = await medication_ai_service.generate_safety_information(
            medication_name=medication["name"],
            dosage=medication.get("dosage")
        )
        
        if ai_response["success"]:
            return {
                "medication_id": medication_id,
                "medication_name": medication["name"],
                "safety_info": ai_response["safety_information"],
                "disclaimer": ai_response["disclaimer"],
                "ai_generated": True
            }
        else:
            # Fallback to mock data if AI fails
            safety_info = get_mock_safety_info(medication["name"].lower())
            return {
                "medication_id": medication_id,
                "medication_name": medication["name"],
                "safety_info": safety_info,
                "disclaimer": "This is mock safety information. Please consult your healthcare provider.",
                "ai_generated": False,
                "error": ai_response.get("error")
            }
            
    except Exception as e:
        # Fallback to mock data on any error
        safety_info = get_mock_safety_info(medication["name"].lower())
        return {
            "medication_id": medication_id,
            "medication_name": medication["name"],
            "safety_info": safety_info,
            "disclaimer": "This is mock safety information. Please consult your healthcare provider.",
            "ai_generated": False,
            "error": f"AI service error: {str(e)}"
        }


@router.post("/{medication_id}/doses")
async def log_dose_endpoint(
    medication_id: str,
    dose_log: DoseLogCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Log a dose taken or missed"""
    if not ObjectId.is_valid(medication_id):
        raise HTTPException(status_code=400, detail="Invalid medication ID")
    
    try:
        # Check if medication exists and belongs to user
        medications = await get_medications(current_user["_id"], active_only=False, limit=1000)
        medication = next((med for med in medications if med["id"] == medication_id), None)
        
        if not medication:
            raise HTTPException(status_code=404, detail="Medication not found")
        
        # Prepare dose log data
        dose_data = dose_log.model_dump()
        dose_data["medication_id"] = ObjectId(medication_id)
        
        # Use MongoDB CRUD function to log dose
        created_dose = await log_dose(current_user["_id"], dose_data)
        
        # Update medication adherence rate
        await update_adherence_rate(db, medication_id, current_user["_id"])
        
        return created_dose
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log dose: {str(e)}")


@router.get("/reminders/upcoming")
async def get_upcoming_reminders(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    hours_ahead: int = Query(24, description="Hours ahead to look for reminders")
):
    """Get upcoming medication reminders"""
    now = datetime.utcnow()
    end_time = now + timedelta(hours=hours_ahead)
    
    # Get active medications with reminders enabled
    query = {
        "user_id": ObjectId(current_user["_id"]),
        "reminder_enabled": True,
        "$or": [
            {"end_date": None},
            {"end_date": {"$gte": now}}
        ]
    }
    
    medications = await db.medications.find(query).to_list(length=None)
    
    reminders = []
    for medication in medications:
        # Generate reminders based on medication times
        for time_str in medication.get("times", []):
            try:
                # Parse time string (assuming format like "08:00", "14:30")
                hour, minute = map(int, time_str.split(":"))
                
                # Create reminder for today and tomorrow
                for days_ahead in range(2):
                    reminder_date = now.date() + timedelta(days=days_ahead)
                    reminder_time = datetime.combine(reminder_date, datetime.min.time().replace(hour=hour, minute=minute))
                    
                    if now <= reminder_time <= end_time:
                        reminders.append({
                            "medication_id": str(medication["_id"]),
                            "medication_name": medication["name"],
                            "dosage": medication["dosage"],
                            "scheduled_time": reminder_time,
                            "time_until": str(reminder_time - now)
                        })
            except (ValueError, IndexError):
                continue  # Skip invalid time formats
    
    # Sort by scheduled time
    reminders.sort(key=lambda x: x["scheduled_time"])
    
    return {"reminders": reminders}


async def update_adherence_rate(db: AsyncIOMotorDatabase, medication_id: str, user_id: str):
    """Calculate and update adherence rate for a medication"""
    # Get dose logs for the last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    dose_logs = await db.dose_logs.find({
        "medication_id": ObjectId(medication_id),
        "user_id": ObjectId(user_id),
        "scheduled_time": {"$gte": thirty_days_ago}
    }).to_list(length=None)
    
    if not dose_logs:
        return
    
    taken_count = sum(1 for log in dose_logs if log["status"] == "taken")
    total_count = len(dose_logs)
    adherence_rate = (taken_count / total_count) * 100 if total_count > 0 else 0
    
    # Update medication with new adherence rate
    await db.medications.update_one(
        {"_id": ObjectId(medication_id)},
        {"$set": {"adherence_rate": adherence_rate, "updated_at": datetime.utcnow()}}
    )


def get_mock_safety_info(medication_name: str) -> dict:
    """Get mock safety information for common medications"""
    safety_database = {
        "metformin": {
            "common_side_effects": ["nausea", "diarrhea", "stomach upset", "metallic taste"],
            "serious_side_effects": ["lactic acidosis", "vitamin B12 deficiency"],
            "interactions": ["alcohol", "contrast dyes", "certain antibiotics"],
            "warnings": ["Take with food to reduce stomach upset", "Monitor kidney function"],
            "contraindications": ["severe kidney disease", "liver disease", "heart failure"]
        },
        "lisinopril": {
            "common_side_effects": ["dry cough", "dizziness", "headache", "fatigue"],
            "serious_side_effects": ["angioedema", "hyperkalemia", "kidney problems"],
            "interactions": ["potassium supplements", "NSAIDs", "lithium"],
            "warnings": ["Monitor blood pressure and kidney function", "Avoid potassium supplements"],
            "contraindications": ["pregnancy", "history of angioedema", "bilateral renal artery stenosis"]
        },
        "aspirin": {
            "common_side_effects": ["stomach irritation", "heartburn", "nausea"],
            "serious_side_effects": ["gastrointestinal bleeding", "allergic reactions"],
            "interactions": ["warfarin", "methotrexate", "alcohol"],
            "warnings": ["Take with food", "Not for children with viral infections"],
            "contraindications": ["active bleeding", "severe liver disease", "children under 16"]
        },
        "ibuprofen": {
            "common_side_effects": ["stomach upset", "heartburn", "dizziness", "headache"],
            "serious_side_effects": ["gastrointestinal bleeding", "kidney problems", "heart attack risk"],
            "interactions": ["blood thinners", "ACE inhibitors", "lithium"],
            "warnings": ["Take with food", "Use lowest effective dose", "Limit duration of use"],
            "contraindications": ["active peptic ulcer", "severe heart failure", "severe kidney disease"]
        }
    }
    
    # Return specific info if found, otherwise generic info
    return safety_database.get(medication_name, {
        "common_side_effects": ["Consult your healthcare provider for specific side effects"],
        "serious_side_effects": ["Contact your doctor immediately if you experience unusual symptoms"],
        "interactions": ["Always inform your healthcare provider of all medications you are taking"],
        "warnings": ["Follow your healthcare provider's instructions", "Read medication labels carefully"],
        "contraindications": ["Consult your healthcare provider about any medical conditions"]
    })


@router.get("/{medication_name}/purpose")
async def get_medication_purpose(
    medication_name: str,
    current_user: dict = Depends(get_current_user)
):
    """Get AI-powered medication purpose analysis"""
    try:
        # Use AI service to analyze medication purpose
        ai_response = await medication_ai_service.analyze_medication_purpose(medication_name)
        
        if ai_response["success"]:
            purpose_data = ai_response["purpose_analysis"]
            return MedicationPurposeResponse(
                medication_name=purpose_data["medication_name"],
                primary_purpose=purpose_data["primary_purpose"],
                secondary_purposes=purpose_data["secondary_purposes"],
                mechanism_of_action=purpose_data["mechanism_of_action"],
                therapeutic_class=purpose_data["therapeutic_class"],
                disclaimer=ai_response["disclaimer"]
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to analyze medication purpose: {ai_response.get('error', 'Unknown error')}"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing medication purpose: {str(e)}"
        )


@router.post("/ai-assist")
async def medication_ai_assist(
    request: MedicationAIAssistRequest,
    current_user: dict = Depends(get_current_user)
):
    """Comprehensive AI-powered medication assistance"""
    try:
        # Route to appropriate AI service method based on query type
        if request.query_type == "safety":
            ai_response = await medication_ai_service.generate_safety_information(
                medication_name=request.medication_name
            )
        elif request.query_type == "purpose":
            ai_response = await medication_ai_service.analyze_medication_purpose(
                medication_name=request.medication_name
            )
        elif request.query_type == "suggestions":
            ai_response = await medication_ai_service.suggest_medications(
                partial_name=request.medication_name,
                patient_context=request.patient_context
            )
        else:
            # For general queries, use safety information as default
            ai_response = await medication_ai_service.generate_safety_information(
                medication_name=request.medication_name
            )
        
        if ai_response["success"]:
            return MedicationAIAssistResponse(
                success=True,
                medication_name=request.medication_name,
                query_type=request.query_type,
                response_data=ai_response,
                disclaimer=ai_response["disclaimer"],
                generated_at=datetime.utcnow()
            )
        else:
            return MedicationAIAssistResponse(
                success=False,
                medication_name=request.medication_name,
                query_type=request.query_type,
                response_data={"error": ai_response.get("error", "Unknown error")},
                disclaimer="AI service encountered an error. Please consult your healthcare provider.",
                generated_at=datetime.utcnow()
            )
            
    except Exception as e:
        return MedicationAIAssistResponse(
            success=False,
            medication_name=request.medication_name,
            query_type=request.query_type,
            response_data={"error": str(e)},
            disclaimer="AI service encountered an error. Please consult your healthcare provider.",
            generated_at=datetime.utcnow()
        )