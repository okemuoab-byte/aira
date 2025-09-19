from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema


class UserBase(BaseModel):
    email: EmailStr
    name: str
    birthday: Optional[datetime] = None
    gender: Optional[str] = None
    height: Optional[Dict[str, Any]] = None
    weight: Optional[Dict[str, Any]] = None
    conditions: List[str] = []
    family_history: List[Dict[str, Any]] = []
    preferences: Dict[str, Any] = {}


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    birthday: Optional[datetime] = None
    gender: Optional[str] = None
    height: Optional[Dict[str, Any]] = None
    weight: Optional[Dict[str, Any]] = None
    conditions: Optional[List[str]] = None
    family_history: Optional[List[Dict[str, Any]]] = None
    preferences: Optional[Dict[str, Any]] = None


class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    password_hash: str
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class User(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


# Symptom Models
class SymptomBase(BaseModel):
    body_part_id: Optional[str] = None
    body_part_name: Optional[str] = None
    type: str
    intensity: int = Field(..., ge=1, le=10)
    notes: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None
    photos: List[Dict[str, Any]] = []
    measurements: List[Dict[str, Any]] = []
    triggers: List[str] = []
    treatments: List[str] = []
    food_history: List[str] = []
    timestamp: datetime


class SymptomCreate(SymptomBase):
    pass


class SymptomUpdate(BaseModel):
    body_part_id: Optional[str] = None
    body_part_name: Optional[str] = None
    type: Optional[str] = None
    intensity: Optional[int] = Field(None, ge=1, le=10)
    notes: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None
    photos: Optional[List[Dict[str, Any]]] = None
    measurements: Optional[List[Dict[str, Any]]] = None
    triggers: Optional[List[str]] = None
    treatments: Optional[List[str]] = None
    food_history: Optional[List[str]] = None


class SymptomInDB(SymptomBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class Symptom(SymptomBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}