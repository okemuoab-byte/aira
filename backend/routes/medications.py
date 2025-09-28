from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from auth import get_current_user
from models import MedicationCreate, MedicationUpdate, DoseLogCreate
from database import get_database

router = APIRouter()


@router.post("/")
async def create_medication(
    medication: MedicationCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new medication"""
    medication_dict = medication.model_dump()
    medication_dict["user_id"] = ObjectId(current_user["_id"])
    medication_dict["created_at"] = datetime.utcnow()
    medication_dict["updated_at"] = datetime.utcnow()
    
    result = await db.medications.insert_one(medication_dict)
    
    # Retrieve the created medication
    created_medication = await db.medications.find_one({"_id": result.inserted_id})
    if not created_medication:
        raise HTTPException(status_code=500, detail="Failed to create medication")
    
    # Convert ObjectId to string for JSON serialization
    created_medication["id"] = str(created_medication["_id"])
    created_medication["user_id"] = str(created_medication["user_id"])
    del created_medication["_id"]
    
    return created_medication


@router.get("/")
async def get_medications(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    active_only: bool = Query(True, description="Filter to show only active medications"),
    limit: int = Query(100, le=1000, description="Maximum number of medications to return")
):
    """Get user's medications with optional filtering"""
    query = {"user_id": ObjectId(current_user["_id"])}
    
    # Add active/inactive filtering
    if active_only:
        now = datetime.utcnow()
        query["$or"] = [
            {"end_date": None},
            {"end_date": {"$gte": now}}
        ]
    
    cursor = db.medications.find(query).sort("created_at", -1).limit(limit)
    medications = await cursor.to_list(length=limit)
    
    # Convert ObjectIds to strings for JSON serialization
    for medication in medications:
        medication["id"] = str(medication["_id"])
        medication["user_id"] = str(medication["user_id"])
        del medication["_id"]
    
    return medications


@router.get("/{medication_id}")
async def get_medication(
    medication_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific medication by ID"""
    if not ObjectId.is_valid(medication_id):
        raise HTTPException(status_code=400, detail="Invalid medication ID")
    
    medication = await db.medications.find_one({
        "_id": ObjectId(medication_id),
        "user_id": ObjectId(current_user["_id"])
    })
    
    if not medication:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    # Convert ObjectId to string for JSON serialization
    medication["id"] = str(medication["_id"])
    medication["user_id"] = str(medication["user_id"])
    del medication["_id"]
    
    return medication


@router.put("/{medication_id}")
async def update_medication(
    medication_id: str,
    medication_update: MedicationUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update a medication"""
    if not ObjectId.is_valid(medication_id):
        raise HTTPException(status_code=400, detail="Invalid medication ID")
    
    # Check if medication exists and belongs to user
    existing_medication = await db.medications.find_one({
        "_id": ObjectId(medication_id),
        "user_id": ObjectId(current_user["_id"])
    })
    
    if not existing_medication:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    # Prepare update data
    update_data = {k: v for k, v in medication_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    # Update the medication
    result = await db.medications.update_one(
        {"_id": ObjectId(medication_id)},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update medication")
    
    # Return updated medication
    updated_medication = await db.medications.find_one({"_id": ObjectId(medication_id)})
    
    # Convert ObjectId to string for JSON serialization
    updated_medication["id"] = str(updated_medication["_id"])
    updated_medication["user_id"] = str(updated_medication["user_id"])
    del updated_medication["_id"]
    
    return updated_medication


@router.delete("/{medication_id}")
async def delete_medication(
    medication_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete a medication"""
    if not ObjectId.is_valid(medication_id):
        raise HTTPException(status_code=400, detail="Invalid medication ID")
    
    # Check if medication exists and belongs to user
    existing_medication = await db.medications.find_one({
        "_id": ObjectId(medication_id),
        "user_id": ObjectId(current_user["_id"])
    })
    
    if not existing_medication:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    # Delete the medication
    result = await db.medications.delete_one({"_id": ObjectId(medication_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Failed to delete medication")
    
    return {"message": "Medication deleted successfully"}


@router.get("/{medication_id}/safety")
async def get_medication_safety_info(
    medication_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get safety information for a medication"""
    if not ObjectId.is_valid(medication_id):
        raise HTTPException(status_code=400, detail="Invalid medication ID")
    
    # Check if medication exists and belongs to user
    medication = await db.medications.find_one({
        "_id": ObjectId(medication_id),
        "user_id": ObjectId(current_user["_id"])
    })
    
    if not medication:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    # This would typically integrate with a drug database API
    # For now, returning mock safety information based on common medications
    medication_name = medication["name"].lower()
    
    safety_info = get_mock_safety_info(medication_name)
    
    return {
        "medication_id": medication_id,
        "medication_name": medication["name"],
        "safety_info": safety_info
    }


@router.post("/{medication_id}/doses")
async def log_dose(
    medication_id: str,
    dose_log: DoseLogCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Log a dose taken or missed"""
    if not ObjectId.is_valid(medication_id):
        raise HTTPException(status_code=400, detail="Invalid medication ID")
    
    # Check if medication exists and belongs to user
    medication = await db.medications.find_one({
        "_id": ObjectId(medication_id),
        "user_id": ObjectId(current_user["_id"])
    })
    
    if not medication:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    # Create dose log entry
    dose_dict = dose_log.model_dump()
    dose_dict["user_id"] = ObjectId(current_user["_id"])
    dose_dict["created_at"] = datetime.utcnow()
    
    result = await db.dose_logs.insert_one(dose_dict)
    
    # Update medication adherence rate
    await update_adherence_rate(db, medication_id, current_user["_id"])
    
    # Retrieve the created dose log
    created_dose = await db.dose_logs.find_one({"_id": result.inserted_id})
    
    # Convert ObjectId to string for JSON serialization
    created_dose["id"] = str(created_dose["_id"])
    created_dose["user_id"] = str(created_dose["user_id"])
    created_dose["medication_id"] = str(created_dose["medication_id"])
    del created_dose["_id"]
    
    return created_dose


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