from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from auth import get_current_user
from models import User, UserUpdate
from database import get_database, get_user_by_id, update_user

router = APIRouter()


@router.get("/profile")
async def get_user_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get detailed user profile with family history"""
    try:
        # Get the full user document using MongoDB CRUD function
        user_doc = await get_user_by_id(current_user["_id"])
        
        if not user_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Remove sensitive information
        if "password_hash" in user_doc:
            del user_doc["password_hash"]
        
        # Add profile completeness score
        profile_completeness = calculate_profile_completeness(user_doc)
        user_doc["profile_completeness"] = profile_completeness
        
        return {
            "user": user_doc,
            "message": "Profile retrieved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user profile: {str(e)}"
        )


@router.put("/profile")
async def update_user_profile(
    profile_update: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update user profile and preferences"""
    try:
        # Check if user exists using MongoDB CRUD function
        existing_user = await get_user_by_id(current_user["_id"])
        
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prepare update data - only include non-None values
        update_data = {k: v for k, v in profile_update.model_dump().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields provided for update"
            )
        
        # Validate specific fields if provided
        if "gender" in update_data:
            valid_genders = ["male", "female", "other", "prefer_not_to_say"]
            if update_data["gender"].lower() not in valid_genders:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid gender. Must be one of: {', '.join(valid_genders)}"
                )
            update_data["gender"] = update_data["gender"].lower()
        
        # Validate height format if provided
        if "height" in update_data and update_data["height"]:
            if not isinstance(update_data["height"], dict) or "value" not in update_data["height"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Height must be an object with 'value' and 'unit' fields"
                )
        
        # Validate weight format if provided
        if "weight" in update_data and update_data["weight"]:
            if not isinstance(update_data["weight"], dict) or "value" not in update_data["weight"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Weight must be an object with 'value' and 'unit' fields"
                )
        
        # Update the user profile using MongoDB CRUD function
        success = await update_user(current_user["_id"], update_data)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No changes were made to the profile"
            )
        
        # Retrieve and return updated user profile
        updated_user = await get_user_by_id(current_user["_id"])
        
        # Remove sensitive information
        if "password_hash" in updated_user:
            del updated_user["password_hash"]
        
        # Add profile completeness score
        profile_completeness = calculate_profile_completeness(updated_user)
        updated_user["profile_completeness"] = profile_completeness
        
        return {
            "user": updated_user,
            "message": "Profile updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user profile: {str(e)}"
        )


def calculate_profile_completeness(user_doc: dict) -> dict:
    """Calculate profile completeness percentage and missing fields"""
    required_fields = [
        "name", "email", "birthday", "gender", "height", "weight"
    ]
    
    optional_fields = [
        "conditions", "family_history", "preferences"
    ]
    
    completed_required = 0
    completed_optional = 0
    missing_fields = []
    
    # Check required fields
    for field in required_fields:
        if field in user_doc and user_doc[field] is not None:
            if field in ["height", "weight"]:
                # For height/weight, check if it's a proper dict with value
                if isinstance(user_doc[field], dict) and user_doc[field].get("value"):
                    completed_required += 1
                else:
                    missing_fields.append(field)
            else:
                completed_required += 1
        else:
            missing_fields.append(field)
    
    # Check optional fields
    for field in optional_fields:
        if field in user_doc and user_doc[field]:
            if isinstance(user_doc[field], list) and len(user_doc[field]) > 0:
                completed_optional += 1
            elif isinstance(user_doc[field], dict) and len(user_doc[field]) > 0:
                completed_optional += 1
    
    # Calculate percentages
    required_percentage = (completed_required / len(required_fields)) * 100
    optional_percentage = (completed_optional / len(optional_fields)) * 100
    overall_percentage = (required_percentage * 0.7) + (optional_percentage * 0.3)
    
    return {
        "overall_percentage": round(overall_percentage, 1),
        "required_percentage": round(required_percentage, 1),
        "optional_percentage": round(optional_percentage, 1),
        "missing_required_fields": missing_fields,
        "completed_required": completed_required,
        "total_required": len(required_fields),
        "completed_optional": completed_optional,
        "total_optional": len(optional_fields)
    }