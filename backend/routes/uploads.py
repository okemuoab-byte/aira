import os
import uuid
import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
import aiofiles

from auth import get_current_user
from models import (
    User, PhotoCreate, PhotoUpdate, Photo, PhotoInDB, PhotoUploadResponse,
    ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE
)
from database import get_database

router = APIRouter()

# Upload directory configuration
UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename to prevent conflicts"""
    file_extension = os.path.splitext(original_filename)[1].lower()
    unique_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    return f"{timestamp}_{unique_id}{file_extension}"


def validate_image_file(file: UploadFile) -> None:
    """Validate uploaded image file"""
    # Check file type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )


@router.post("/photos", response_model=PhotoUploadResponse)
async def upload_photo(
    file: UploadFile = File(...),
    symptom_id: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    measurements: Optional[str] = Form(None),  # JSON string
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Upload a symptom photo with metadata"""
    try:
        # Validate the uploaded file
        validate_image_file(file)
        
        # Generate unique filename
        unique_filename = generate_unique_filename(file.filename)
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Read and validate file size
        file_content = await file.read()
        file_size = len(file_content)
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        # Parse measurements if provided
        parsed_measurements = None
        if measurements:
            try:
                parsed_measurements = json.loads(measurements)
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid measurements format. Must be valid JSON."
                )
        
        # Validate symptom_id if provided
        if symptom_id:
            if not ObjectId.is_valid(symptom_id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid symptom ID"
                )
            
            # Check if symptom exists and belongs to user
            symptom = await db.symptoms.find_one({
                "_id": ObjectId(symptom_id),
                "user_id": ObjectId(current_user["_id"])
            })
            if not symptom:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Symptom not found"
                )
        
        # Save file to disk
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_content)
        
        # Create photo document
        photo_data = {
            "user_id": ObjectId(current_user["_id"]),
            "symptom_id": ObjectId(symptom_id) if symptom_id else None,
            "filename": unique_filename,
            "file_path": file_path,
            "description": description,
            "measurements": parsed_measurements,
            "file_size": file_size,
            "mime_type": file.content_type,
            "timestamp": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert photo into database
        result = await db.photos.insert_one(photo_data)
        
        # Retrieve the created photo
        created_photo = await db.photos.find_one({"_id": result.inserted_id})
        if not created_photo:
            # Clean up file if database insert failed
            try:
                os.remove(file_path)
            except:
                pass
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create photo record"
            )
        
        # Convert ObjectIds to strings for response
        response_data = {
            "id": str(created_photo["_id"]),
            "filename": created_photo["filename"],
            "file_path": created_photo["file_path"],
            "description": created_photo.get("description"),
            "measurements": created_photo.get("measurements"),
            "file_size": created_photo["file_size"],
            "mime_type": created_photo["mime_type"],
            "symptom_id": str(created_photo["symptom_id"]) if created_photo.get("symptom_id") else None,
            "timestamp": created_photo["timestamp"],
            "created_at": created_photo["created_at"],
            "message": "Photo uploaded successfully"
        }
        
        return PhotoUploadResponse(**response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        # Clean up file if something went wrong
        if 'file_path' in locals():
            try:
                os.remove(file_path)
            except:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload photo: {str(e)}"
        )


@router.get("/photos/{photo_id}")
async def get_photo(
    photo_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get photo metadata by ID"""
    if not ObjectId.is_valid(photo_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid photo ID"
        )
    
    photo = await db.photos.find_one({
        "_id": ObjectId(photo_id),
        "user_id": ObjectId(current_user["_id"])
    })
    
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    # Convert ObjectIds to strings for JSON serialization
    photo["id"] = str(photo["_id"])
    photo["user_id"] = str(photo["user_id"])
    if photo.get("symptom_id"):
        photo["symptom_id"] = str(photo["symptom_id"])
    del photo["_id"]
    
    return photo


@router.get("/photos/{photo_id}/file")
async def get_photo_file(
    photo_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Serve the actual photo file"""
    if not ObjectId.is_valid(photo_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid photo ID"
        )
    
    photo = await db.photos.find_one({
        "_id": ObjectId(photo_id),
        "user_id": ObjectId(current_user["_id"])
    })
    
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    file_path = photo["file_path"]
    
    # Check if file exists on disk
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo file not found on disk"
        )
    
    return FileResponse(
        path=file_path,
        media_type=photo["mime_type"],
        filename=photo["filename"]
    )


@router.put("/photos/{photo_id}")
async def update_photo(
    photo_id: str,
    photo_update: PhotoUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update photo metadata"""
    if not ObjectId.is_valid(photo_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid photo ID"
        )
    
    # Check if photo exists and belongs to user
    existing_photo = await db.photos.find_one({
        "_id": ObjectId(photo_id),
        "user_id": ObjectId(current_user["_id"])
    })
    
    if not existing_photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    # Prepare update data
    update_data = {k: v for k, v in photo_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields provided for update"
        )
    
    update_data["updated_at"] = datetime.utcnow()
    
    # Update the photo
    result = await db.photos.update_one(
        {"_id": ObjectId(photo_id)},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No changes were made to the photo"
        )
    
    # Return updated photo
    updated_photo = await db.photos.find_one({"_id": ObjectId(photo_id)})
    
    # Convert ObjectIds to strings for JSON serialization
    updated_photo["id"] = str(updated_photo["_id"])
    updated_photo["user_id"] = str(updated_photo["user_id"])
    if updated_photo.get("symptom_id"):
        updated_photo["symptom_id"] = str(updated_photo["symptom_id"])
    del updated_photo["_id"]
    
    return updated_photo


@router.delete("/photos/{photo_id}")
async def delete_photo(
    photo_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete a photo and its file"""
    if not ObjectId.is_valid(photo_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid photo ID"
        )
    
    # Check if photo exists and belongs to user
    existing_photo = await db.photos.find_one({
        "_id": ObjectId(photo_id),
        "user_id": ObjectId(current_user["_id"])
    })
    
    if not existing_photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    # Delete from database
    result = await db.photos.delete_one({"_id": ObjectId(photo_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete photo from database"
        )
    
    # Delete file from disk
    file_path = existing_photo["file_path"]
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        # Log the error but don't fail the request since DB deletion succeeded
        print(f"Warning: Failed to delete file {file_path}: {str(e)}")
    
    return {"message": "Photo deleted successfully"}


@router.get("/symptoms/{symptom_id}/photos")
async def get_symptom_photos(
    symptom_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all photos for a specific symptom"""
    if not ObjectId.is_valid(symptom_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid symptom ID"
        )
    
    # Check if symptom exists and belongs to user
    symptom = await db.symptoms.find_one({
        "_id": ObjectId(symptom_id),
        "user_id": ObjectId(current_user["_id"])
    })
    
    if not symptom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Symptom not found"
        )
    
    # Get all photos for this symptom
    cursor = db.photos.find({
        "symptom_id": ObjectId(symptom_id),
        "user_id": ObjectId(current_user["_id"])
    }).sort("created_at", -1)
    
    photos = await cursor.to_list(length=None)
    
    # Convert ObjectIds to strings for JSON serialization
    for photo in photos:
        photo["id"] = str(photo["_id"])
        photo["user_id"] = str(photo["user_id"])
        photo["symptom_id"] = str(photo["symptom_id"])
        del photo["_id"]
    
    return {"photos": photos, "count": len(photos)}


@router.get("/photos")
async def get_user_photos(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    limit: int = 50
):
    """Get all photos for the current user"""
    cursor = db.photos.find({
        "user_id": ObjectId(current_user["_id"])
    }).sort("created_at", -1).limit(limit)
    
    photos = await cursor.to_list(length=limit)
    
    # Convert ObjectIds to strings for JSON serialization
    for photo in photos:
        photo["id"] = str(photo["_id"])
        photo["user_id"] = str(photo["user_id"])
        if photo.get("symptom_id"):
            photo["symptom_id"] = str(photo["symptom_id"])
        del photo["_id"]
    
    return {"photos": photos, "count": len(photos)}