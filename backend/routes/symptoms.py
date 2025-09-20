from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from auth import get_current_user
from models import User, SymptomCreate, SymptomUpdate, Symptom, SymptomInDB
from database import get_database

router = APIRouter()


@router.post("/")
async def create_symptom(
    symptom: SymptomCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new symptom entry"""
    symptom_dict = symptom.model_dump()
    symptom_dict["user_id"] = ObjectId(current_user["_id"])
    symptom_dict["created_at"] = datetime.utcnow()
    symptom_dict["updated_at"] = datetime.utcnow()
    
    result = await db.symptoms.insert_one(symptom_dict)
    
    # Retrieve the created symptom
    created_symptom = await db.symptoms.find_one({"_id": result.inserted_id})
    if not created_symptom:
        raise HTTPException(status_code=500, detail="Failed to create symptom")
    
    # Convert ObjectId to string for JSON serialization
    created_symptom["id"] = str(created_symptom["_id"])
    created_symptom["user_id"] = str(created_symptom["user_id"])
    del created_symptom["_id"]
    
    return created_symptom


@router.get("/")
async def get_symptoms(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    start_date: Optional[datetime] = Query(None, description="Filter symptoms from this date"),
    end_date: Optional[datetime] = Query(None, description="Filter symptoms until this date"),
    body_part: Optional[str] = Query(None, description="Filter by body part"),
    limit: int = Query(100, le=1000, description="Maximum number of symptoms to return")
):
    """Get user's symptom history with optional filtering"""
    query = {"user_id": ObjectId(current_user["_id"])}
    
    # Add date filtering
    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = start_date
        if end_date:
            date_filter["$lte"] = end_date
        query["timestamp"] = date_filter
    
    # Add body part filtering
    if body_part:
        query["body_part_id"] = body_part
    
    cursor = db.symptoms.find(query).sort("timestamp", -1).limit(limit)
    symptoms = await cursor.to_list(length=limit)
    
    # Convert ObjectIds to strings for JSON serialization
    for symptom in symptoms:
        symptom["id"] = str(symptom["_id"])
        symptom["user_id"] = str(symptom["user_id"])
        del symptom["_id"]
    
    return symptoms


@router.get("/{symptom_id}")
async def get_symptom(
    symptom_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific symptom by ID"""
    if not ObjectId.is_valid(symptom_id):
        raise HTTPException(status_code=400, detail="Invalid symptom ID")
    
    symptom = await db.symptoms.find_one({
        "_id": ObjectId(symptom_id),
        "user_id": ObjectId(current_user["_id"])
    })
    
    if not symptom:
        raise HTTPException(status_code=404, detail="Symptom not found")
    
    # Convert ObjectId to string for JSON serialization
    symptom["id"] = str(symptom["_id"])
    symptom["user_id"] = str(symptom["user_id"])
    del symptom["_id"]
    
    return symptom


@router.put("/{symptom_id}")
async def update_symptom(
    symptom_id: str,
    symptom_update: SymptomUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update a symptom entry (24-hour window)"""
    if not ObjectId.is_valid(symptom_id):
        raise HTTPException(status_code=400, detail="Invalid symptom ID")
    
    # Check if symptom exists and belongs to user
    existing_symptom = await db.symptoms.find_one({
        "_id": ObjectId(symptom_id),
        "user_id": ObjectId(current_user["_id"])
    })
    
    if not existing_symptom:
        raise HTTPException(status_code=404, detail="Symptom not found")
    
    # Check 24-hour edit window
    created_at = existing_symptom.get("created_at")
    if created_at and datetime.utcnow() - created_at > timedelta(hours=24):
        raise HTTPException(
            status_code=403, 
            detail="Symptom can only be edited within 24 hours of creation"
        )
    
    # Prepare update data
    update_data = {k: v for k, v in symptom_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    # Update the symptom
    result = await db.symptoms.update_one(
        {"_id": ObjectId(symptom_id)},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update symptom")
    
    # Return updated symptom
    updated_symptom = await db.symptoms.find_one({"_id": ObjectId(symptom_id)})
    
    # Convert ObjectId to string for JSON serialization
    updated_symptom["id"] = str(updated_symptom["_id"])
    updated_symptom["user_id"] = str(updated_symptom["user_id"])
    del updated_symptom["_id"]
    
    return updated_symptom


@router.delete("/{symptom_id}")
async def delete_symptom(
    symptom_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Soft delete a symptom entry"""
    if not ObjectId.is_valid(symptom_id):
        raise HTTPException(status_code=400, detail="Invalid symptom ID")
    
    # Check if symptom exists and belongs to user
    existing_symptom = await db.symptoms.find_one({
        "_id": ObjectId(symptom_id),
        "user_id": ObjectId(current_user["_id"])
    })
    
    if not existing_symptom:
        raise HTTPException(status_code=404, detail="Symptom not found")
    
    # Soft delete by adding deleted_at timestamp
    result = await db.symptoms.update_one(
        {"_id": ObjectId(symptom_id)},
        {"$set": {"deleted_at": datetime.utcnow(), "updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to delete symptom")
    
    return {"message": "Symptom deleted successfully"}


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