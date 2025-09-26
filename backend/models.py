from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId


# Use string type for ObjectId fields to avoid Pydantic v2 compatibility issues
PyObjectId = str


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


# Medication Models
class MedicationBase(BaseModel):
    name: str
    dosage: str
    frequency: str
    times: List[str] = []
    start_date: datetime
    end_date: Optional[datetime] = None
    notes: Optional[str] = None
    reminder_enabled: bool = True
    side_effects: List[str] = []
    effectiveness: Optional[int] = Field(None, ge=1, le=10)
    adherence_rate: Optional[float] = Field(None, ge=0.0, le=100.0)
    missed_doses: List[Dict[str, Any]] = []


class MedicationCreate(MedicationBase):
    pass


class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    times: Optional[List[str]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    notes: Optional[str] = None
    reminder_enabled: Optional[bool] = None
    side_effects: Optional[List[str]] = None
    effectiveness: Optional[int] = Field(None, ge=1, le=10)
    adherence_rate: Optional[float] = Field(None, ge=0.0, le=100.0)
    missed_doses: Optional[List[Dict[str, Any]]] = None


class MedicationInDB(MedicationBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class Medication(MedicationBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Dose tracking models
class DoseLogBase(BaseModel):
    medication_id: PyObjectId
    scheduled_time: datetime
    actual_time: Optional[datetime] = None
    status: str  # "taken", "missed", "skipped"
    notes: Optional[str] = None


class DoseLogCreate(DoseLogBase):
    pass


class DoseLog(DoseLogBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime

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


# Healthcare Visit Models
class HealthcareVisitBase(BaseModel):
    date: datetime
    provider_type: str  # GP, A&E, Hospital, Specialist, etc.
    provider_name: str
    reason_for_visit: str
    summary: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    prescriptions: List[Dict[str, Any]] = []
    referrals: List[Dict[str, Any]] = []
    follow_up_required: bool = False
    follow_up_date: Optional[datetime] = None
    notes: Optional[str] = None
    cost: Optional[Dict[str, Any]] = None  # amount, currency, insurance_covered
    attachments: List[Dict[str, Any]] = []  # documents, images, etc.


class HealthcareVisitCreate(HealthcareVisitBase):
    pass


class HealthcareVisitUpdate(BaseModel):
    date: Optional[datetime] = None
    provider_type: Optional[str] = None
    provider_name: Optional[str] = None
    reason_for_visit: Optional[str] = None
    summary: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    prescriptions: Optional[List[Dict[str, Any]]] = None
    referrals: Optional[List[Dict[str, Any]]] = None
    follow_up_required: Optional[bool] = None
    follow_up_date: Optional[datetime] = None
    notes: Optional[str] = None
    cost: Optional[Dict[str, Any]] = None
    attachments: Optional[List[Dict[str, Any]]] = None


class HealthcareVisitInDB(HealthcareVisitBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class HealthcareVisit(HealthcareVisitBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Provider Types for validation
PROVIDER_TYPES = [
    "GP",
    "A&E",
    "Hospital",
    "Specialist",
    "Dentist",
    "Optometrist",
    "Physiotherapist",
    "Mental Health",
    "Urgent Care",
    "Walk-in Clinic",
    "Telemedicine",
    "Other"
]


# Family Member Models
class FamilyMemberBase(BaseModel):
    name: str
    email: EmailStr
    relationship: str  # spouse, parent, child, sibling, family, caregiver, friend
    access_level: str  # view_only, emergency_contact, caregiver
    shared_data: List[str] = []  # symptoms, medications, appointments, photos
    invite_status: str = "pending"  # pending, accepted, declined


class FamilyMemberCreate(FamilyMemberBase):
    pass


class FamilyMemberUpdate(BaseModel):
    name: Optional[str] = None
    relationship: Optional[str] = None
    access_level: Optional[str] = None
    shared_data: Optional[List[str]] = None


class FamilyMemberInDB(FamilyMemberBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId  # The user who invited this family member
    invited_date: datetime
    accepted_date: Optional[datetime] = None
    last_access: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class FamilyMember(FamilyMemberBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    invited_date: datetime
    accepted_date: Optional[datetime] = None
    last_access: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Share Settings Models
class ShareSettingsBase(BaseModel):
    symptoms_sharing: bool = True
    medications_sharing: bool = True
    appointments_sharing: bool = True
    photos_sharing: bool = False
    emergency_contacts_can_override: bool = True
    family_summary_enabled: bool = True


class ShareSettingsUpdate(BaseModel):
    symptoms_sharing: Optional[bool] = None
    medications_sharing: Optional[bool] = None
    appointments_sharing: Optional[bool] = None
    photos_sharing: Optional[bool] = None
    emergency_contacts_can_override: Optional[bool] = None
    family_summary_enabled: Optional[bool] = None


class ShareSettingsInDB(ShareSettingsBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ShareSettings(ShareSettingsBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Family invitation request model
class FamilyInviteRequest(BaseModel):
    name: str
    email: EmailStr
    relationship: str
    access_level: str = "view_only"
    shared_data: List[str] = ["symptoms", "medications", "appointments"]


# Constants for validation
RELATIONSHIP_TYPES = [
    "spouse", "parent", "child", "sibling", "family", "caregiver", "friend"
]

ACCESS_LEVELS = [
    "view_only", "emergency_contact", "caregiver"
]

SHARED_DATA_TYPES = [
    "symptoms", "medications", "appointments", "photos"
]


# Photo Models
class PhotoBase(BaseModel):
    symptom_id: Optional[PyObjectId] = None
    filename: str
    file_path: str
    description: Optional[str] = None
    measurements: Optional[Dict[str, Any]] = None  # e.g., {"length": "2cm", "width": "1cm", "color": "red"}
    file_size: int  # in bytes
    mime_type: str  # e.g., "image/jpeg", "image/png"
    timestamp: datetime


class PhotoCreate(BaseModel):
    symptom_id: Optional[str] = None
    description: Optional[str] = None
    measurements: Optional[Dict[str, Any]] = None


class PhotoUpdate(BaseModel):
    description: Optional[str] = None
    measurements: Optional[Dict[str, Any]] = None


class PhotoInDB(PhotoBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class Photo(PhotoBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# File upload response model
class PhotoUploadResponse(BaseModel):
    id: str
    filename: str
    file_path: str
    description: Optional[str] = None
    measurements: Optional[Dict[str, Any]] = None
    file_size: int
    mime_type: str
    symptom_id: Optional[str] = None
    timestamp: datetime
    created_at: datetime
    message: str


# Supported file types and limits
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes


# Health Insights Models
class HealthScoreData(BaseModel):
    overall_score: float = Field(..., ge=0.0, le=100.0)
    symptom_score: float = Field(..., ge=0.0, le=100.0)
    medication_score: float = Field(..., ge=0.0, le=100.0)
    visit_score: float = Field(..., ge=0.0, le=100.0)
    trend: str  # "improving", "stable", "declining"
    last_updated: datetime


class BodySystemBreakdown(BaseModel):
    system_name: str
    symptom_count: int
    avg_intensity: float
    most_common_symptom: Optional[str] = None
    percentage: float = Field(..., ge=0.0, le=100.0)


class DashboardSummary(BaseModel):
    total_symptoms: int
    symptoms_this_week: int
    symptoms_this_month: int
    avg_intensity_week: float
    avg_intensity_month: float
    active_medications: int
    medication_adherence_rate: float
    recent_visits: int
    body_system_breakdown: List[BodySystemBreakdown]
    health_score: HealthScoreData
    time_period: str


class PatternInsight(BaseModel):
    type: str  # "frequency", "intensity", "correlation", "timing"
    title: str
    description: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    severity: str  # "low", "medium", "high"
    data_points: int
    time_range: str
    actionable: bool = True


class TrendData(BaseModel):
    symptom_type: str
    body_part: Optional[str] = None
    trend_direction: str  # "increasing", "decreasing", "stable"
    change_percentage: float
    current_avg_intensity: float
    previous_avg_intensity: float
    data_points: int
    time_period: str
    significance: str  # "significant", "moderate", "minimal"


class SymptomCorrelation(BaseModel):
    symptom_a: str
    symptom_b: str
    correlation_strength: float = Field(..., ge=0.0, le=1.0)
    co_occurrence_rate: float = Field(..., ge=0.0, le=100.0)
    description: str


class HealthInsight(BaseModel):
    id: str
    category: str  # "pattern", "trend", "correlation", "alert"
    title: str
    description: str
    insight_type: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    severity: str  # "low", "medium", "high"
    actionable: bool
    recommendations: List[str]
    data_source: str
    time_range: str
    created_at: datetime


class RecommendationItem(BaseModel):
    id: str
    category: str  # "medication", "lifestyle", "medical", "monitoring"
    title: str
    description: str
    priority: str  # "low", "medium", "high", "urgent"
    action_type: str  # "track", "consult", "modify", "schedule"
    estimated_impact: str  # "low", "medium", "high"
    time_sensitive: bool
    based_on: List[str]  # What data this recommendation is based on


class HealthDashboardResponse(BaseModel):
    summary: DashboardSummary
    recent_patterns: List[PatternInsight]
    quick_insights: List[str]
    alerts: List[str]
    generated_at: datetime


class HealthInsightsResponse(BaseModel):
    insights: List[HealthInsight]
    pattern_analysis: List[PatternInsight]
    correlations: List[SymptomCorrelation]
    confidence_summary: Dict[str, float]
    data_quality_score: float = Field(..., ge=0.0, le=1.0)
    generated_at: datetime


class HealthTrendsResponse(BaseModel):
    symptom_trends: List[TrendData]
    intensity_progression: Dict[str, List[Dict[str, Any]]]
    frequency_analysis: Dict[str, Any]
    body_system_trends: Dict[str, Any]
    time_period: str
    trend_summary: str
    generated_at: datetime


class HealthRecommendationsResponse(BaseModel):
    recommendations: List[RecommendationItem]
    priority_actions: List[RecommendationItem]
    lifestyle_suggestions: List[str]
    monitoring_suggestions: List[str]
    medical_consultation_needed: bool
    generated_at: datetime