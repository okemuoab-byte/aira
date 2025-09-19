import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from models import User, TokenData

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET", "your-super-secret-jwt-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRES_IN", 86400)) // 60  # Convert seconds to minutes

# Security scheme
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_user_by_email(database: AsyncIOMotorDatabase, email: str) -> Optional[dict]:
    """Get user by email from database."""
    user = await database.users.find_one({"email": email})
    return user


async def authenticate_user(database: AsyncIOMotorDatabase, email: str, password: str) -> Optional[dict]:
    """Authenticate user with email and password."""
    user = await get_user_by_email(database, email)
    if not user:
        return None
    if not verify_password(password, user["password_hash"]):
        return None
    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    database: AsyncIOMotorDatabase = None
) -> dict:
    """Get current user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = await get_user_by_email(database, email=token_data.email)
    if user is None:
        raise credentials_exception
    
    return user


def create_user_response(user_doc: dict) -> dict:
    """Convert user document to response format."""
    user_response = {
        "id": str(user_doc["_id"]),
        "email": user_doc["email"],
        "name": user_doc["name"],
        "birthday": user_doc.get("birthday"),
        "gender": user_doc.get("gender"),
        "height": user_doc.get("height"),
        "weight": user_doc.get("weight"),
        "conditions": user_doc.get("conditions", []),
        "family_history": user_doc.get("family_history", []),
        "preferences": user_doc.get("preferences", {}),
        "created_at": user_doc["created_at"],
        "updated_at": user_doc["updated_at"]
    }
    return user_response


async def create_user(database: AsyncIOMotorDatabase, user_data: dict) -> dict:
    """Create a new user in the database."""
    # Check if user already exists
    existing_user = await get_user_by_email(database, user_data["email"])
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data["password"])
    
    # Create user document
    now = datetime.utcnow()
    user_doc = {
        "email": user_data["email"],
        "password_hash": hashed_password,
        "name": user_data["name"],
        "birthday": user_data.get("birthday"),
        "gender": user_data.get("gender"),
        "height": user_data.get("height"),
        "weight": user_data.get("weight"),
        "conditions": user_data.get("conditions", []),
        "family_history": user_data.get("family_history", []),
        "preferences": user_data.get("preferences", {}),
        "created_at": now,
        "updated_at": now
    }
    
    # Insert user
    result = await database.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    
    return user_doc