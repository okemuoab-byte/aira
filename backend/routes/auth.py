from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase

from models import Token, LoginRequest, SignupRequest, User
from auth import (
    authenticate_user, 
    create_access_token, 
    create_user, 
    create_user_response,
    get_current_user,
    security,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(tags=["authentication"])


def get_database():
    """Dependency to get database instance."""
    from main import database
    return database


@router.post("/signup", response_model=dict)
async def signup(
    signup_data: SignupRequest,
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """Register a new user."""
    try:
        user_doc = await create_user(database, signup_data.dict())
        user_response = create_user_response(user_doc)
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_doc["email"]}, 
            expires_delta=access_token_expires
        )
        
        return {
            "user": user_response,
            "access_token": access_token,
            "token_type": "bearer"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )


@router.post("/login", response_model=dict)
async def login(
    login_data: LoginRequest,
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """Authenticate user and return access token."""
    user = await authenticate_user(database, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, 
        expires_delta=access_token_expires
    )
    
    user_response = create_user_response(user)
    
    return {
        "user": user_response,
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/logout")
async def logout():
    """Logout user (client-side token removal)."""
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=dict)
async def get_current_user_profile(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get current user profile."""
    user = await get_current_user(credentials, database)
    return create_user_response(user)