from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from auth import get_current_user
from models import HealthcareVisitCreate, HealthcareVisitUpdate, HealthcareVisit, PROVIDER_TYPES
from database import get_database, create_visit, get_visits, update_visit, delete_visit

router = APIRouter()


@router.post("/")
async def create_healthcare_visit(
    visit: HealthcareVisitCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Log a new healthcare visit"""
    try:
        # Validate provider type
        if visit.provider_type not in PROVIDER_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid provider type. Must be one of: {', '.join(PROVIDER_TYPES)}"
            )
        
        # Validate visit date (shouldn't be too far in the future)
        if visit.date > datetime.utcnow() + timedelta(days=30):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Visit date cannot be more than 30 days in the future"
            )
        
        # Use MongoDB CRUD function to create visit
        created_visit = await create_visit(current_user["_id"], visit.model_dump())
        
        return {
            "visit": created_visit,
            "message": "Healthcare visit logged successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create healthcare visit: {str(e)}"
        )


@router.get("/")
async def get_healthcare_visits(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    start_date: Optional[datetime] = Query(None, description="Filter visits from this date"),
    end_date: Optional[datetime] = Query(None, description="Filter visits until this date"),
    provider_type: Optional[str] = Query(None, description="Filter by provider type"),
    limit: int = Query(50, le=200, description="Maximum number of visits to return"),
    skip: int = Query(0, ge=0, description="Number of visits to skip for pagination")
):
    """Get user's healthcare visit history with optional filtering"""
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
            filters["date"] = date_filter
        
        # Add provider type filtering
        if provider_type:
            if provider_type not in PROVIDER_TYPES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid provider type. Must be one of: {', '.join(PROVIDER_TYPES)}"
                )
            filters["provider_type"] = provider_type
        
        # Use MongoDB CRUD function to get visits
        visits = await get_visits(current_user["_id"], filters, limit, skip)
        
        # For pagination, we need to get total count manually since the CRUD function doesn't return it
        # This is a limitation we'll accept for now
        total_count = len(visits) + skip  # Approximate count
        
        return {
            "visits": visits,
            "pagination": {
                "total": total_count,
                "limit": limit,
                "skip": skip,
                "has_more": len(visits) == limit  # If we got the full limit, there might be more
            },
            "message": "Healthcare visits retrieved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve healthcare visits: {str(e)}"
        )


@router.get("/{visit_id}")
async def get_healthcare_visit(
    visit_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific healthcare visit by ID"""
    try:
        if not ObjectId.is_valid(visit_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid visit ID"
            )
        
        # Use MongoDB CRUD function to get visits with filter by ID
        visits = await get_visits(current_user["_id"], {"_id": ObjectId(visit_id)}, 1)
        
        if not visits:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Healthcare visit not found"
            )
        
        return {
            "visit": visits[0],
            "message": "Healthcare visit retrieved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve healthcare visit: {str(e)}"
        )


@router.put("/{visit_id}")
async def update_healthcare_visit(
    visit_id: str,
    visit_update: HealthcareVisitUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update healthcare visit details"""
    try:
        if not ObjectId.is_valid(visit_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid visit ID"
            )
        
        # Check if visit exists and belongs to user
        existing_visits = await get_visits(current_user["_id"], {"_id": ObjectId(visit_id)}, 1)
        
        if not existing_visits:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Healthcare visit not found"
            )
        
        # Prepare update data - only include non-None values
        update_data = {k: v for k, v in visit_update.model_dump().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields provided for update"
            )
        
        # Validate provider type if provided
        if "provider_type" in update_data:
            if update_data["provider_type"] not in PROVIDER_TYPES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid provider type. Must be one of: {', '.join(PROVIDER_TYPES)}"
                )
        
        # Validate visit date if provided
        if "date" in update_data:
            if update_data["date"] > datetime.utcnow() + timedelta(days=30):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Visit date cannot be more than 30 days in the future"
                )
        
        # Use MongoDB CRUD function to update visit
        success = await update_visit(visit_id, current_user["_id"], update_data)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No changes were made to the visit"
            )
        
        # Return updated visit
        updated_visits = await get_visits(current_user["_id"], {"_id": ObjectId(visit_id)}, 1)
        
        return {
            "visit": updated_visits[0] if updated_visits else None,
            "message": "Healthcare visit updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update healthcare visit: {str(e)}"
        )


@router.delete("/{visit_id}")
async def delete_healthcare_visit(
    visit_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete a healthcare visit"""
    try:
        if not ObjectId.is_valid(visit_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid visit ID"
            )
        
        # Check if visit exists and belongs to user
        existing_visits = await get_visits(current_user["_id"], {"_id": ObjectId(visit_id)}, 1)
        
        if not existing_visits:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Healthcare visit not found"
            )
        
        # Use MongoDB CRUD function to delete visit
        success = await delete_visit(visit_id, current_user["_id"])
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete healthcare visit"
            )
        
        return {"message": "Healthcare visit deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete healthcare visit: {str(e)}"
        )


@router.get("/stats/summary")
async def get_visit_statistics(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
    year: Optional[int] = Query(None, description="Filter by year")
):
    """Get healthcare visit statistics and summary"""
    try:
        # Build base query
        query = {"user_id": ObjectId(current_user["_id"])}
        
        # Add year filtering if provided
        if year:
            start_date = datetime(year, 1, 1)
            end_date = datetime(year + 1, 1, 1)
            query["date"] = {"$gte": start_date, "$lt": end_date}
        
        # Get all visits for statistics
        visits = await db.healthcare_visits.find(query).to_list(length=None)
        
        # Calculate statistics
        total_visits = len(visits)
        provider_stats = {}
        monthly_stats = {}
        follow_up_required = 0
        
        for visit in visits:
            # Provider type statistics
            provider_type = visit.get("provider_type", "Unknown")
            provider_stats[provider_type] = provider_stats.get(provider_type, 0) + 1
            
            # Monthly statistics
            visit_date = visit.get("date")
            if visit_date:
                month_key = visit_date.strftime("%Y-%m")
                monthly_stats[month_key] = monthly_stats.get(month_key, 0) + 1
            
            # Follow-up statistics
            if visit.get("follow_up_required", False):
                follow_up_required += 1
        
        # Get upcoming follow-ups
        upcoming_followups = []
        for visit in visits:
            if visit.get("follow_up_required") and visit.get("follow_up_date"):
                if visit["follow_up_date"] >= datetime.utcnow():
                    upcoming_followups.append({
                        "visit_id": str(visit["_id"]),
                        "provider_name": visit.get("provider_name"),
                        "provider_type": visit.get("provider_type"),
                        "follow_up_date": visit["follow_up_date"],
                        "reason": visit.get("reason_for_visit")
                    })
        
        # Sort upcoming follow-ups by date
        upcoming_followups.sort(key=lambda x: x["follow_up_date"])
        
        return {
            "statistics": {
                "total_visits": total_visits,
                "follow_up_required": follow_up_required,
                "provider_breakdown": provider_stats,
                "monthly_breakdown": monthly_stats,
                "upcoming_followups": upcoming_followups[:5]  # Limit to next 5
            },
            "message": "Visit statistics retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve visit statistics: {str(e)}"
        )