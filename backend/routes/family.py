from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from auth import get_current_user
from models import (
    FamilyMemberCreate, FamilyMemberUpdate, FamilyMember, FamilyInviteRequest,
    ShareSettingsUpdate, ShareSettings,
    RELATIONSHIP_TYPES, ACCESS_LEVELS, SHARED_DATA_TYPES
)
from database import get_database, create_family_member, get_family_members, update_sharing_settings

router = APIRouter()


@router.post("/invite")
async def invite_family_member(
    invite_request: FamilyInviteRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Invite a family member with specified access level and sharing permissions"""
    try:
        # Validate relationship type
        if invite_request.relationship not in RELATIONSHIP_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid relationship type. Must be one of: {', '.join(RELATIONSHIP_TYPES)}"
            )
        
        # Validate access level
        if invite_request.access_level not in ACCESS_LEVELS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid access level. Must be one of: {', '.join(ACCESS_LEVELS)}"
            )
        
        # Validate shared data types
        for data_type in invite_request.shared_data:
            if data_type not in SHARED_DATA_TYPES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid shared data type '{data_type}'. Must be one of: {', '.join(SHARED_DATA_TYPES)}"
                )
        
        # Check if family member already exists
        existing_members = await get_family_members(current_user["_id"])
        for member in existing_members:
            if member["email"] == invite_request.email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Family member with this email already exists"
                )
        
        # Create family member invitation using MongoDB CRUD function
        family_member_data = {
            "name": invite_request.name,
            "email": invite_request.email,
            "relationship": invite_request.relationship,
            "access_level": invite_request.access_level,
            "shared_data": invite_request.shared_data,
            "invite_status": "pending",
            "invited_date": datetime.utcnow()
        }
        
        created_member = await create_family_member(current_user["_id"], family_member_data)
        
        return {
            "family_member": created_member,
            "message": "Family member invitation sent successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to invite family member: {str(e)}"
        )


@router.get("/members")
async def get_family_members_endpoint(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get list of all family members for the current user"""
    try:
        # Use MongoDB CRUD function to get family members
        family_members = await get_family_members(current_user["_id"])
        
        return {
            "family_members": family_members,
            "total": len(family_members),
            "message": "Family members retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve family members: {str(e)}"
        )


@router.put("/members/{member_id}")
async def update_family_member(
    member_id: str,
    member_update: FamilyMemberUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update family member permissions and details"""
    try:
        if not ObjectId.is_valid(member_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid family member ID"
            )
        
        # Check if family member exists and belongs to user
        existing_member = await db.family_members.find_one({
            "_id": ObjectId(member_id),
            "user_id": ObjectId(current_user["_id"])
        })
        
        if not existing_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Family member not found"
            )
        
        # Prepare update data - only include non-None values
        update_data = {k: v for k, v in member_update.model_dump().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields provided for update"
            )
        
        # Validate relationship type if provided
        if "relationship" in update_data:
            if update_data["relationship"] not in RELATIONSHIP_TYPES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid relationship type. Must be one of: {', '.join(RELATIONSHIP_TYPES)}"
                )
        
        # Validate access level if provided
        if "access_level" in update_data:
            if update_data["access_level"] not in ACCESS_LEVELS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid access level. Must be one of: {', '.join(ACCESS_LEVELS)}"
                )
        
        # Validate shared data types if provided
        if "shared_data" in update_data:
            for data_type in update_data["shared_data"]:
                if data_type not in SHARED_DATA_TYPES:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Invalid shared data type '{data_type}'. Must be one of: {', '.join(SHARED_DATA_TYPES)}"
                    )
        
        # Add updated timestamp
        update_data["updated_at"] = datetime.utcnow()
        
        # Update the family member
        result = await db.family_members.update_one(
            {"_id": ObjectId(member_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No changes were made to the family member"
            )
        
        # Return updated family member
        updated_member = await db.family_members.find_one({"_id": ObjectId(member_id)})
        
        # Convert ObjectId to string for JSON serialization
        updated_member["id"] = str(updated_member["_id"])
        updated_member["user_id"] = str(updated_member["user_id"])
        del updated_member["_id"]
        
        return {
            "family_member": updated_member,
            "message": "Family member updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update family member: {str(e)}"
        )


@router.delete("/members/{member_id}")
async def remove_family_member(
    member_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Remove a family member"""
    try:
        if not ObjectId.is_valid(member_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid family member ID"
            )
        
        # Check if family member exists and belongs to user
        existing_member = await db.family_members.find_one({
            "_id": ObjectId(member_id),
            "user_id": ObjectId(current_user["_id"])
        })
        
        if not existing_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Family member not found"
            )
        
        # Delete the family member
        result = await db.family_members.delete_one({"_id": ObjectId(member_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to remove family member"
            )
        
        return {"message": "Family member removed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove family member: {str(e)}"
        )


@router.put("/settings")
async def update_sharing_settings_endpoint(
    settings_update: ShareSettingsUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update user's sharing preferences and privacy controls"""
    try:
        # Prepare update data - only include non-None values
        update_data = {k: v for k, v in settings_update.model_dump().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields provided for update"
            )
        
        # Use MongoDB CRUD function to update sharing settings
        updated_settings = await update_sharing_settings(current_user["_id"], update_data)
        
        return {
            "settings": updated_settings,
            "message": "Sharing settings updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update sharing settings: {str(e)}"
        )


@router.get("/shared-data")
async def get_shared_data(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get data shared with family members (family member view)"""
    try:
        # Get user's sharing settings
        share_settings = await db.share_settings.find_one({"user_id": ObjectId(current_user["_id"])})
        
        # Default settings if none exist
        if not share_settings:
            share_settings = {
                "symptoms_sharing": True,
                "medications_sharing": True,
                "appointments_sharing": True,
                "photos_sharing": False,
                "family_summary_enabled": True
            }
        
        shared_data = {}
        
        # Get symptoms if sharing is enabled
        if share_settings.get("symptoms_sharing", True):
            symptoms_cursor = db.symptoms.find({"user_id": ObjectId(current_user["_id"])}).sort("timestamp", -1).limit(10)
            symptoms = await symptoms_cursor.to_list(length=10)
            
            # Convert ObjectIds and filter sensitive data
            for symptom in symptoms:
                symptom["id"] = str(symptom["_id"])
                symptom["user_id"] = str(symptom["user_id"])
                del symptom["_id"]
                # Remove detailed notes for privacy
                if "notes" in symptom:
                    symptom["notes"] = symptom["notes"][:100] + "..." if len(symptom["notes"]) > 100 else symptom["notes"]
            
            shared_data["symptoms"] = symptoms
        
        # Get medications if sharing is enabled
        if share_settings.get("medications_sharing", True):
            medications_cursor = db.medications.find({"user_id": ObjectId(current_user["_id"])}).sort("created_at", -1)
            medications = await medications_cursor.to_list(length=None)
            
            # Convert ObjectIds and filter sensitive data
            for medication in medications:
                medication["id"] = str(medication["_id"])
                medication["user_id"] = str(medication["user_id"])
                del medication["_id"]
                # Keep essential medication info for family
                medication.pop("missed_doses", None)
            
            shared_data["medications"] = medications
        
        # Get appointments if sharing is enabled
        if share_settings.get("appointments_sharing", True):
            appointments_cursor = db.healthcare_visits.find({"user_id": ObjectId(current_user["_id"])}).sort("date", -1).limit(5)
            appointments = await appointments_cursor.to_list(length=5)
            
            # Convert ObjectIds and filter sensitive data
            for appointment in appointments:
                appointment["id"] = str(appointment["_id"])
                appointment["user_id"] = str(appointment["user_id"])
                del appointment["_id"]
                # Remove detailed notes for privacy
                if "notes" in appointment:
                    appointment["notes"] = appointment["notes"][:100] + "..." if len(appointment["notes"]) > 100 else appointment["notes"]
            
            shared_data["appointments"] = appointments
        
        # Generate family summary if enabled
        if share_settings.get("family_summary_enabled", True):
            summary = await generate_family_summary(current_user["_id"], db, share_settings)
            shared_data["summary"] = summary
        
        return {
            "shared_data": shared_data,
            "sharing_settings": {
                "symptoms_sharing": share_settings.get("symptoms_sharing", True),
                "medications_sharing": share_settings.get("medications_sharing", True),
                "appointments_sharing": share_settings.get("appointments_sharing", True),
                "photos_sharing": share_settings.get("photos_sharing", False)
            },
            "message": "Shared data retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve shared data: {str(e)}"
        )


async def generate_family_summary(user_id: str, db: AsyncIOMotorDatabase, share_settings: dict) -> dict:
    """Generate a family-friendly health summary based on sharing permissions"""
    try:
        summary = {
            "last_updated": datetime.utcnow(),
            "health_status": "stable",
            "recent_activity": []
        }
        
        # Recent symptoms summary
        if share_settings.get("symptoms_sharing", True):
            recent_symptoms = await db.symptoms.find(
                {"user_id": ObjectId(user_id)}
            ).sort("timestamp", -1).limit(3).to_list(length=3)
            
            if recent_symptoms:
                summary["recent_activity"].append({
                    "type": "symptoms",
                    "count": len(recent_symptoms),
                    "last_recorded": recent_symptoms[0]["timestamp"],
                    "severity_trend": "stable"  # Could be calculated based on intensity trends
                })
        
        # Medication adherence summary
        if share_settings.get("medications_sharing", True):
            active_medications = await db.medications.find(
                {"user_id": ObjectId(user_id), "end_date": {"$gte": datetime.utcnow()}}
            ).to_list(length=None)
            
            if active_medications:
                avg_adherence = sum(med.get("adherence_rate", 100) for med in active_medications) / len(active_medications)
                summary["recent_activity"].append({
                    "type": "medications",
                    "active_count": len(active_medications),
                    "adherence_rate": round(avg_adherence, 1)
                })
        
        # Recent appointments summary
        if share_settings.get("appointments_sharing", True):
            recent_visits = await db.healthcare_visits.find(
                {"user_id": ObjectId(user_id)}
            ).sort("date", -1).limit(2).to_list(length=2)
            
            if recent_visits:
                summary["recent_activity"].append({
                    "type": "appointments",
                    "last_visit": recent_visits[0]["date"],
                    "provider": recent_visits[0]["provider_type"],
                    "follow_up_needed": recent_visits[0].get("follow_up_required", False)
                })
        
        return summary
        
    except Exception as e:
        return {
            "last_updated": datetime.utcnow(),
            "health_status": "unknown",
            "error": "Failed to generate summary"
        }