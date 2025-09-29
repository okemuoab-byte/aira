from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import ValidationError

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


async def get_database():
    """Dependency to get database instance."""
    from database import get_database as get_db
    return await get_db()


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
    except ValidationError as e:
        # Handle Pydantic validation errors with detailed messages
        error_details = []
        for error in e.errors():
            field = error.get('loc', ['unknown'])[-1]  # Get the field name
            message = error.get('msg', 'Validation error')
            error_details.append(f"{field}: {message}")
        
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": "Validation failed",
                "errors": error_details,
                "type": "validation_error"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        # Check if it's a user already exists error
        if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "message": "User with this email already exists",
                    "errors": ["email: A user with this email address already exists"],
                    "type": "duplicate_user_error"
                }
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": "Failed to create user",
                "errors": [f"server: {str(e)}"],
                "type": "server_error"
            }
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