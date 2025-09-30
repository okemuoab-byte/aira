
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Union
from enum import Enum
from pydantic import BaseModel, Field, EmailStr, field_validator, model_validator
from bson import ObjectId
from pymongo import IndexModel, ASCENDING, DESCENDING, TEXT


class PyObjectId(ObjectId):
    """Custom ObjectId class for Pydantic v2 compatibility"""
    
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        from pydantic_core import core_schema
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str) and ObjectId.is_valid(v):
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")


class MongoBaseModel(BaseModel):
    """Base model for MongoDB documents with common fields and utilities"""
    
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: lambda v: v.isoformat()}
        use_enum_values = True

    def to_dict(self, exclude_none: bool = True) -> Dict[str, Any]:
        """Convert model to dictionary for MongoDB operations"""
        data = self.dict(by_alias=True, exclude_none=exclude_none)
        if "_id" in data and isinstance(data["_id"], str):
            data["_id"] = ObjectId(data["_id"])
        return data

    @classmethod
    def from_mongo(cls, data: Dict[str, Any]):
        """Create model instance from MongoDB document"""
        if not data:
            return None
        if "_id" in data:
            data["id"] = str(data["_id"])
        return cls(**data)

    def to_json_dict(self) -> Dict[str, Any]:
        """Convert to JSON-serializable dictionary"""
        data = self.dict()
        data["id"] = str(self.id)
        if "_id" in data:
            del data["_id"]
        return data


# Enums for validation
class GenderEnum(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class ProviderTypeEnum(str, Enum):
    GP = "GP"
    AE = "A&E"
    HOSPITAL = "Hospital"
    SPECIALIST = "Specialist"
    DENTIST = "Dentist"
    OPTOMETRIST = "Optometrist"
    PHYSIOTHERAPIST = "Physiotherapist"
    MENTAL_HEALTH = "Mental Health"
    URGENT_CARE = "Urgent Care"
    WALK_IN_CLINIC = "Walk-in Clinic"
    TELEMEDICINE = "Telemedicine"
    OTHER = "Other"


class RelationshipEnum(str, Enum):
    SPOUSE = "spouse"
    PARENT = "parent"
    CHILD = "child"
    SIBLING = "sibling"
    FAMILY = "family"
    CAREGIVER = "caregiver"
    FRIEND = "friend"


class AccessLevelEnum(str, Enum):
    VIEW_ONLY = "view_only"
    EMERGENCY_CONTACT = "emergency_contact"
    CAREGIVER = "caregiver"


class SharedDataTypeEnum(str, Enum):
    SYMPTOMS = "symptoms"
    MEDICATIONS = "medications"
    APPOINTMENTS = "appointments"
    PHOTOS = "photos"


class DoseStatusEnum(str, Enum):
    TAKEN = "taken"
    MISSED = "missed"
    SKIPPED = "skipped"


class InviteStatusEnum(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"


# User Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    birthday: Optional[datetime] = None
    gender: Optional[GenderEnum] = None
    height: Optional[Dict[str, Any]] = None  # {"value": 175, "unit": "cm"}
    weight: Optional[Dict[str, Any]] = None  # {"value": 70, "unit": "kg"}
    conditions: List[str] = Field(default_factory=list)
    family_history: List[Dict[str, Any]] = Field(default_factory=list)
    preferences: Dict[str, Any] = Field(default_factory=dict)

    @field_validator('height', 'weight')
    @classmethod
    def validate_measurement(cls, v):
        if v is not None:
            if not isinstance(v, dict) or 'value' not in v or 'unit' not in v:
                raise ValueError('Measurement must have value and unit fields')
            if not isinstance(v['value'], (int, float)) or v['value'] <= 0:
                raise ValueError('Measurement value must be a positive number')
        return v


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    name: Optional[str] = None
    birthday: Optional[datetime] = None
    gender: Optional[GenderEnum] = None
    height: Optional[Dict[str, Any]] = None
    weight: Optional[Dict[str, Any]] = None
    conditions: Optional[List[str]] = None
    family_history: Optional[List[Dict[str, Any]]] = None
    preferences: Optional[Dict[str, Any]] = None

    @field_validator('height', 'weight')
    @classmethod
    def validate_measurement(cls, v):
        if v is not None:
            if not isinstance(v, dict) or 'value' not in v or 'unit' not in v:
                raise ValueError('Measurement must have value and unit fields')
            if not isinstance(v['value'], (int, float)) or v['value'] <= 0:
                raise ValueError('Measurement value must be a positive number')
        return v


class UserInDB(MongoBaseModel, UserBase):
    password_hash: str
    is_active: bool = True
    email_verified: bool = False
    last_login: Optional[datetime] = None
    deleted_at: Optional[datetime] = None  # For soft deletes

    @classmethod
    def get_indexes(cls) -> List[IndexModel]:
        return [
            IndexModel([("email", ASCENDING)], unique=True),
            IndexModel([("created_at", DESCENDING)]),
            IndexModel([("updated_at", DESCENDING)]),
            IndexModel([("deleted_at", ASCENDING)], sparse=True),
            IndexModel([("is_active", ASCENDING)]),
        ]


class User(MongoBaseModel, UserBase):
    profile_completeness: Optional[Dict[str, Any]] = None

    @classmethod
    def from_user_in_db(cls, user_in_db: UserInDB):
        """Create User from UserInDB, excluding sensitive fields"""
        data = user_in_db.dict(exclude={"password_hash"})
        return cls(**data)


# Authentication Models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")
    name: str = Field(..., min_length=1, description="Name is required")
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Name cannot be empty or contain only whitespace')
        return v.strip()
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


# Symptom Models
class SymptomBase(BaseModel):
    body_part_id: Optional[str] = None
    body_part_name: Optional[str] = None
    type: str = Field(..., min_length=1)
    intensity: int = Field(..., ge=1, le=10)
    notes: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None
    photos: List[Dict[str, Any]] = Field(default_factory=list)
    measurements: List[Dict[str, Any]] = Field(default_factory=list)
    triggers: List[str] = Field(default_factory=list)
    treatments: List[str] = Field(default_factory=list)
    food_history: List[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_validator('coordinates')
    @classmethod
    def validate_coordinates(cls, v):
        if v is not None:
            required_keys = {'x', 'y'}
            if not all(key in v for key in required_keys):
                raise ValueError('Coordinates must have x and y values')
            if not all(isinstance(v[key], (int, float)) for key in required_keys):
                raise ValueError('Coordinate values must be numbers')
        return v


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


class SymptomInDB(MongoBaseModel, SymptomBase):
    user_id: PyObjectId
    deleted_at: Optional[datetime] = None  # For soft deletes

    @classmethod
    def get_indexes(cls) -> List[IndexModel]:
        return [
            IndexModel([("user_id", ASCENDING), ("timestamp", DESCENDING)]),
            IndexModel([("user_id", ASCENDING), ("body_part_id", ASCENDING)]),
            IndexModel([("user_id", ASCENDING), ("type", ASCENDING)]),
            IndexModel([("user_id", ASCENDING), ("intensity", ASCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
            IndexModel([("deleted_at", ASCENDING)], sparse=True),
            IndexModel([("type", TEXT), ("notes", TEXT)]),
        ]


class Symptom(MongoBaseModel, SymptomBase):
    user_id: PyObjectId


# Medication Models
class MedicationBase(BaseModel):
    name: str = Field(..., min_length=1)
    dosage: str = Field(..., min_length=1)
    frequency: str = Field(..., min_length=1)
    times: List[str] = Field(default_factory=list)
    start_date: datetime
    end_date: Optional[datetime] = None
    notes: Optional[str] = None
    reminder_enabled: bool = True
    side_effects: List[str] = Field(default_factory=list)
    effectiveness: Optional[int] = Field(None, ge=1, le=10)
    adherence_rate: Optional[float] = Field(None, ge=0.0, le=100.0)
    missed_doses: List[Dict[str, Any]] = Field(default_factory=list)

    @model_validator(mode='after')
    def validate_end_date(self):
        if self.end_date is not None and self.start_date is not None and self.end_date <= self.start_date:
            raise ValueError('End date must be after start date')
        return self

    @field_validator('times')
    @classmethod
    def validate_times(cls, v):
        for time_str in v:
            try:
                # Validate time format (HH:MM)
                hour, minute = map(int, time_str.split(':'))
                if not (0 <= hour <= 23 and 0 <= minute <= 59):
                    raise ValueError(f'Invalid time format: {time_str}')
            except (ValueError, AttributeError):
                raise ValueError(f'Time must be in HH:MM format: {time_str}')
        return v


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


class MedicationInDB(MongoBaseModel, MedicationBase):
    user_id: PyObjectId
    deleted_at: Optional[datetime] = None

    @classmethod
    def get_indexes(cls) -> List[IndexModel]:
        return [
            IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)]),
            IndexModel([("user_id", ASCENDING), ("name", ASCENDING)]),
            IndexModel([("user_id", ASCENDING), ("start_date", ASCENDING)]),
            IndexModel([("user_id", ASCENDING), ("end_date", ASCENDING)]),
            IndexModel([("user_id", ASCENDING), ("reminder_enabled", ASCENDING)]),
            IndexModel([("deleted_at", ASCENDING)], sparse=True),
            IndexModel([("name", TEXT)]),
        ]


class Medication(MongoBaseModel, MedicationBase):
    user_id: PyObjectId


# Dose Log Models
class DoseLogBase(BaseModel):
    medication_id: PyObjectId
    scheduled_time: datetime
    actual_time: Optional[datetime] = None
    status: DoseStatusEnum
    notes: Optional[str] = None

    @model_validator(mode='after')
    def validate_actual_time(self):
        if (self.actual_time is not None and
            self.status == DoseStatusEnum.TAKEN and
            self.actual_time < self.scheduled_time):
            # Allow some flexibility for early doses (up to 2 hours)
            time_diff = self.scheduled_time - self.actual_time
            if time_diff.total_seconds() > 7200:  # 2 hours
                raise ValueError('Actual time cannot be more than 2 hours before scheduled time')
        return self


class DoseLogCreate(DoseLogBase):
    pass


class DoseLogInDB(MongoBaseModel, DoseLogBase):
    user_id: PyObjectId

    @classmethod
    def get_indexes(cls) -> List[IndexModel]:
        return [
            IndexModel([("user_id", ASCENDING), ("medication_id", ASCENDING), ("scheduled_time", DESCENDING)]),
            IndexModel([("user_id", ASCENDING), ("status", ASCENDING)]),
            IndexModel([("medication_id", ASCENDING), ("scheduled_time", DESCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
        ]


class DoseLog(MongoBaseModel, DoseLogBase):
    user_id: PyObjectId


# Healthcare Visit Models
class HealthcareVisitBase(BaseModel):
    date: datetime
    provider_type: ProviderTypeEnum
    provider_name: str = Field(..., min_length=1)
    reason_for_visit: str = Field(..., min_length=1)
    summary: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    prescriptions: List[Dict[str, Any]] = Field(default_factory=list)
    referrals: List[Dict[str, Any]] = Field(default_factory=list)
    follow_up_required: bool = False
    follow_up_date: Optional[datetime] = None
    notes: Optional[str] = None
    cost: Optional[Dict[str, Any]] = None
    attachments: List[Dict[str, Any]] = Field(default_factory=list)

    @model_validator(mode='after')
    def validate_follow_up_date(self):
        if self.follow_up_date is not None and self.follow_up_required is False:
            raise ValueError('Follow-up date should not be set when follow-up is not required')
        if self.follow_up_date is not None and self.date is not None and self.follow_up_date <= self.date:
            raise ValueError('Follow-up date must be after visit date')
        return self

    @field_validator('cost')
    @classmethod
    def validate_cost(cls, v):
        if v is not None:
            required_keys = {'amount', 'currency'}
            if not all(key in v for key in required_keys):
                raise ValueError('Cost must have amount and currency fields')
            if not isinstance(v['amount'], (int, float)) or v['amount'] < 0:
                raise ValueError('Cost amount must be a non-negative number')
        return v


class HealthcareVisitCreate(HealthcareVisitBase):
    pass


class HealthcareVisitUpdate(BaseModel):
    date: Optional[datetime] = None
    provider_type: Optional[ProviderTypeEnum] = None
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


class HealthcareVisitInDB(MongoBaseModel, HealthcareVisitBase):
    user_id: PyObjectId
    deleted_at: Optional[datetime] = None

    @classmethod
    def get_indexes(cls) -> List[IndexModel]:
        return [
            IndexModel([("user_id", ASCENDING), ("date", DESCENDING)]),
            IndexModel([("user_id", ASCENDING), ("provider_type", ASCENDING)]),
            IndexModel([("user_id", ASCENDING), ("follow_up_required", ASCENDING)]),
            IndexModel([("follow_up_date", ASCENDING)], sparse=True),
            IndexModel([("created_at", DESCENDING)]),
            IndexModel([("deleted_at", ASCENDING)], sparse=True),
            IndexModel([("provider_name", TEXT), ("diagnosis", TEXT), ("notes", TEXT)]),
        ]


class HealthcareVisit(MongoBaseModel, HealthcareVisitBase):
    user_id: PyObjectId


# Family Member Models
class FamilyMemberBase(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    relationship: RelationshipEnum
    access_level: AccessLevelEnum = AccessLevelEnum.VIEW_ONLY
    shared_data: List[SharedDataTypeEnum] = Field(default_factory=lambda: [
        SharedDataTypeEnum.SYMPTOMS,
        SharedDataTypeEnum.MEDICATIONS,
        SharedDataTypeEnum.APPOINTMENTS
    ])
    invite_status: InviteStatusEnum = InviteStatusEnum.PENDING


class FamilyMemberCreate(FamilyMemberBase):
    pass


class FamilyMemberUpdate(BaseModel):
    name: Optional[str] = None
    relationship: Optional[RelationshipEnum] = None
    access_level: Optional[AccessLevelEnum] = None
    shared_data: Optional[List[SharedDataTypeEnum]] = None


class FamilyMemberInDB(MongoBaseModel, FamilyMemberBase):
    user_id: PyObjectId  # The user who invited this family member
    invited_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    accepted_date: Optional[datetime] = None
    last_access: Optional[datetime] = None

    @classmethod
    def get_indexes(cls) -> List[IndexModel]:
        return [
            IndexModel([("user_id", ASCENDING), ("email", ASCENDING)], unique=True),
            IndexModel([("user_id", ASCENDING), ("invite_status", ASCENDING)]),
            IndexModel([("user_id", ASCENDING), ("access_level", ASCENDING)]),
            IndexModel([("email", ASCENDING)]),
            IndexModel([("invited_date", DESCENDING)]),
        ]


class FamilyMember(MongoBaseModel, FamilyMemberBase):
    user_id: PyObjectId
    invited_date: datetime
    accepted_date: Optional[datetime] = None
    last_access: Optional[datetime] = None


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


class ShareSettingsInDB(MongoBaseModel, ShareSettingsBase):
    user_id: PyObjectId

    @classmethod
    def get_indexes(cls) -> List[IndexModel]:
        return [
            IndexModel([("user_id", ASCENDING)], unique=True),
            IndexModel([("updated_at", DESCENDING)]),
        ]


class ShareSettings(MongoBaseModel, ShareSettingsBase):
    user_id: PyObjectId


# Photo Models
class PhotoBase(BaseModel):
    symptom_id: Optional[PyObjectId] = None
    filename: str = Field(..., min_length=1)
    file_path: str = Field(..., min_length=1)
    description: Optional[str] = None
    measurements: Optional[Dict[str, Any]] = None
    file_size: int = Field(..., gt=0)
    mime_type: str = Field(..., min_length=1)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_validator('mime_type')
    @classmethod
    def validate_mime_type(cls, v):
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        if v not in allowed_types:
            raise ValueError(f'Unsupported file type. Allowed types: {", ".join(allowed_types)}')
        return v

    @field_validator('file_size')
    @classmethod
    def validate_file_size(cls, v):
        max_size = 10 * 1024 * 1024  # 10MB
        if v > max_size:
            raise ValueError(f'File size cannot exceed {max_size} bytes')
        return v


class PhotoCreate(BaseModel):
    symptom_id: Optional[str] = None
    description: Optional[str] = None
    measurements: Optional[Dict[str, Any]] = None


class PhotoUpdate(BaseModel):
    description: Optional[str] = None
    measurements: Optional[Dict[str, Any]] = None


class PhotoInDB(MongoBaseModel, PhotoBase):
    user_id: PyObjectId
    deleted_at: Optional[datetime] = None

    @classmethod
    def get_indexes(cls) -> List[IndexModel]:
        return [
            IndexModel([("user_id", ASCENDING), ("timestamp", DESCENDING)]),
            IndexModel([("user_id", ASCENDING), ("symptom_id", ASCENDING)]),
            IndexModel([("symptom_id", ASCENDING)], sparse=True),
            IndexModel([("created_at", DESCENDING)]),
            IndexModel([("deleted_at", ASCENDING)], sparse=True),
            IndexModel([("filename", ASCENDING)]),
        ]


class Photo(MongoBaseModel, PhotoBase):
    user_id: PyObjectId


# Family Invitation Models
class FamilyInviteRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    relationship: RelationshipEnum
    access_level: AccessLevelEnum = AccessLevelEnum.VIEW_ONLY
    shared_data: List[SharedDataTypeEnum] = Field(default_factory=lambda: [
        SharedDataTypeEnum.SYMPTOMS,
        SharedDataTypeEnum.MEDICATIONS,
        SharedDataTypeEnum.APPOINTMENTS
    ])


# File Upload Models
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


# Health Insights Models
class HealthScoreData(BaseModel):
    overall_score: float = Field(..., ge=0.0, le=100.0)
    symptom_score: float = Field(..., ge=0.0, le=100.0)
    medication_score: float = Field(..., ge=0.0, le=100.0)
    visit_score: float = Field(..., ge=0.0, le=100.0)
    trend: str = Field(..., pattern="^(improving|stable|declining)$")
    last_updated: datetime


class BodySystemBreakdown(BaseModel):
    system_name: str
    symptom_count: int = Field(..., ge=0)
    avg_intensity: float = Field(..., ge=0.0, le=10.0)
    most_common_symptom: Optional[str] = None
    percentage: float = Field(..., ge=0.0, le=100.0)


class DashboardSummary(BaseModel):
    total_symptoms: int = Field(..., ge=0)
    symptoms_this_week: int = Field(..., ge=0)
    symptoms_this_month: int = Field(..., ge=0)
    avg_intensity_week: float = Field(..., ge=0.0, le=10.0)
    avg_intensity_month: float = Field(..., ge=0.0, le=10.0)
    active_medications: int = Field(..., ge=0)
    medication_adherence_rate: float = Field(..., ge=0.0, le=100.0)
    recent_visits: int = Field(..., ge=0)
    body_system_breakdown: List[BodySystemBreakdown]
    health_score: HealthScoreData
    time_period: str


class PatternInsight(BaseModel):
    type: str = Field(..., pattern="^(frequency|intensity|correlation|timing)$")
    title: str
    description: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    severity: str = Field(..., pattern="^(low|medium|high)$")
    data_points: int = Field(..., ge=0)
    time_range: str
    actionable: bool = True


class TrendData(BaseModel):
    symptom_type: str
    body_part: Optional[str] = None
    trend_direction: str = Field(..., pattern="^(increasing|decreasing|stable)$")
    change_percentage: float
    current_avg_intensity: float = Field(..., ge=0.0, le=10.0)
    previous_avg_intensity: float = Field(..., ge=0.0, le=10.0)
    data_points: int = Field(..., ge=0)
    time_period: str
    significance: str = Field(..., pattern="^(significant|moderate|minimal)$")


class SymptomCorrelation(BaseModel):
    symptom_a: str
    symptom_b: str
    correlation_strength: float = Field(..., ge=0.0, le=1.0)
    co_occurrence_rate: float = Field(..., ge=0.0, le=100.0)
    description: str


class HealthInsight(BaseModel):
    id: str
    category: str = Field(..., pattern="^(pattern|trend|correlation|alert)$")
    title: str
    description: str
    insight_type: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    severity: str = Field(..., pattern="^(low|medium|high)$")
    actionable: bool
    recommendations: List[str]
    data_source: str
    time_range: str
    created_at: datetime


class RecommendationItem(BaseModel):
    id: str
    category: str = Field(..., pattern="^(medication|lifestyle|medical|monitoring)$")
    title: str
    description: str
    priority: str = Field(..., pattern="^(low|medium|high|urgent)$")
    action_type: str = Field(..., pattern="^(track|consult|modify|schedule)$")
    estimated_impact: str = Field(..., pattern="^(low|medium|high)$")
    time_sensitive: bool
    based_on: List[str]


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


# Medication AI Models
class MedicationSuggestionRequest(BaseModel):
    query: str = Field(..., description="Partial medication name or description", min_length=1)
    purpose: Optional[str] = Field(None, description="Optional purpose/condition for the medication")


class MedicationPurposeResponse(BaseModel):
    medication_name: str
    primary_purpose: str
    secondary_purposes: List[str]
    mechanism_of_action: str
    therapeutic_class: str
    disclaimer: str


class MedicationAIAssistRequest(BaseModel):
    medication_name: str = Field(..., description="Name of the medication", min_length=1)
    patient_context: Optional[str] = Field(None, description="Patient context (age, conditions, etc.)")
    query_type: str = Field(..., description="Type of assistance needed", pattern="^(safety|interactions|dosage|general|purpose|suggestions)$")
    additional_info: Optional[Dict[str, Any]] = Field(None, description="Additional context information")


class MedicationAIAssistResponse(BaseModel):
    success: bool
    medication_name: str
    query_type: str
    response_data: Dict[str, Any]
    disclaimer: str
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    generated_at: datetime


# MongoDB Schema Definitions
class MongoSchemas:
    """MongoDB schema definitions and utilities"""
    
    @staticmethod
    def get_all_indexes() -> Dict[str, List[IndexModel]]:
        """Get all index definitions for MongoDB collections"""
        return {
            "users": UserInDB.get_indexes(),
            "symptoms": SymptomInDB.get_indexes(),
            "medications": MedicationInDB.get_indexes(),
            "dose_logs": DoseLogInDB.get_indexes(),
            "healthcare_visits": HealthcareVisitInDB.get_indexes(),
            "family_members": FamilyMemberInDB.get_indexes(),
            "photos": PhotoInDB.get_indexes(),
            "share_settings": ShareSettingsInDB.get_indexes(),
        }
    
    @staticmethod
    def get_collection_names() -> List[str]:
        """Get all collection names"""
        return [
            "users", "symptoms", "medications", "dose_logs",
            "healthcare_visits", "family_members", "photos", "share_settings"
        ]


# Utility Functions
def serialize_datetime(dt: datetime) -> str:
    """Serialize datetime to ISO format string"""
    return dt.isoformat() if dt else None


def deserialize_datetime(dt_str: str) -> datetime:
    """Deserialize ISO format string to datetime"""
    return datetime.fromisoformat(dt_str) if dt_str else None


def serialize_objectid(obj_id: ObjectId) -> str:
    """Serialize ObjectId to string"""
    return str(obj_id) if obj_id else None


def deserialize_objectid(obj_id_str: str) -> ObjectId:
    """Deserialize string to ObjectId"""
    return ObjectId(obj_id_str) if obj_id_str and ObjectId.is_valid(obj_id_str) else None


def prepare_for_mongo(data: Dict[str, Any]) -> Dict[str, Any]:
    """Prepare dictionary for MongoDB insertion"""
    prepared = {}
    for key, value in data.items():
        if isinstance(value, datetime):
            prepared[key] = value
        elif isinstance(value, str) and key.endswith('_id') and ObjectId.is_valid(value):
            prepared[key] = ObjectId(value)
        elif isinstance(value, dict):
            prepared[key] = prepare_for_mongo(value)
        elif isinstance(value, list):
            prepared[key] = [prepare_for_mongo(item) if isinstance(item, dict) else item for item in value]
        else:
            prepared[key] = value
    return prepared


def prepare_from_mongo(data: Dict[str, Any]) -> Dict[str, Any]:
    """Prepare MongoDB document for API response"""
    if not data:
        return data
    
    prepared = {}
    for key, value in data.items():
        if key == '_id':
            prepared['id'] = str(value)
        elif isinstance(value, ObjectId):
            prepared[key] = str(value)
        elif isinstance(value, datetime):
            prepared[key] = value.isoformat()
        elif isinstance(value, dict):
            prepared[key] = prepare_from_mongo(value)
        elif isinstance(value, list):
            prepared[key] = [prepare_from_mongo(item) if isinstance(item, dict) else item for item in value]
        else:
            prepared[key] = value
    return prepared


# Constants for validation
PROVIDER_TYPES = [e.value for e in ProviderTypeEnum]
RELATIONSHIP_TYPES = [e.value for e in RelationshipEnum]
ACCESS_LEVELS = [e.value for e in AccessLevelEnum]
SHARED_DATA_TYPES = [e.value for e in SharedDataTypeEnum]
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes


# Validation Schemas
class ValidationSchemas:
    """Validation schemas for different operations"""
    
    @staticmethod
    def validate_user_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate user data before database operations"""
        if 'email' in data:
            # Email validation is handled by EmailStr
            pass
        
        if 'gender' in data and data['gender']:
            if data['gender'] not in [e.value for e in GenderEnum]:
                raise ValueError(f"Invalid gender. Must be one of: {[e.value for e in GenderEnum]}")
        
        if 'height' in data and data['height']:
            if not isinstance(data['height'], dict) or 'value' not in data['height']:
                raise ValueError("Height must be a dictionary with 'value' and 'unit' fields")
        
        if 'weight' in data and data['weight']:
            if not isinstance(data['weight'], dict) or 'value' not in data['weight']:
                raise ValueError("Weight must be a dictionary with 'value' and 'unit' fields")
        
        return data
    
    @staticmethod
    def validate_symptom_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate symptom data before database operations"""
        if 'intensity' in data:
            if not isinstance(data['intensity'], int) or not (1 <= data['intensity'] <= 10):
                raise ValueError("Intensity must be an integer between 1 and 10")
        
        if 'coordinates' in data and data['coordinates']:
            if not isinstance(data['coordinates'], dict):
                raise ValueError("Coordinates must be a dictionary")
            if 'x' not in data['coordinates'] or 'y' not in data['coordinates']:
                raise ValueError("Coordinates must have 'x' and 'y' values")
        
        return data
    
    @staticmethod
    def validate_medication_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate medication data before database operations"""
        if 'times' in data and data['times']:
            for time_str in data['times']:
                try:
                    hour, minute = map(int, time_str.split(':'))
                    if not (0 <= hour <= 23 and 0 <= minute <= 59):
                        raise ValueError(f"Invalid time format: {time_str}")
                except (ValueError, AttributeError):
                    raise ValueError(f"Time must be in HH:MM format: {time_str}")
        
        if 'effectiveness' in data and data['effectiveness'] is not None:
            if not isinstance(data['effectiveness'], int) or not (1 <= data['effectiveness'] <= 10):
                raise ValueError("Effectiveness must be an integer between 1 and 10")
        
        if 'adherence_rate' in data and data['adherence_rate'] is not None:
            if not isinstance(data['adherence_rate'], (int, float)) or not (0 <= data['adherence_rate'] <= 100):
                raise ValueError("Adherence rate must be a number between 0 and 100")
        
        return data
    
    @staticmethod
    def validate_visit_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate healthcare visit data before database operations"""
        if 'provider_type' in data:
            if data['provider_type'] not in PROVIDER_TYPES:
                raise ValueError(f"Invalid provider type. Must be one of: {PROVIDER_TYPES}")
        
        if 'cost' in data and data['cost']:
            if not isinstance(data['cost'], dict):
                raise ValueError("Cost must be a dictionary")
            if 'amount' not in data['cost'] or 'currency' not in data['cost']:
                raise ValueError("Cost must have 'amount' and 'currency' fields")
            if not isinstance(data['cost']['amount'], (int, float)) or data['cost']['amount'] < 0:
                raise ValueError("Cost amount must be a non-negative number")
        
        return data
    
    @staticmethod
    def validate_family_member_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate family member data before database operations"""
        if 'relationship' in data:
            if data['relationship'] not in RELATIONSHIP_TYPES:
                raise ValueError(f"Invalid relationship type. Must be one of: {RELATIONSHIP_TYPES}")
        
        if 'access_level' in data:
            if data['access_level'] not in ACCESS_LEVELS:
                raise ValueError(f"Invalid access level. Must be one of: {ACCESS_LEVELS}")
        
        if 'shared_data' in data and data['shared_data']:
            for data_type in data['shared_data']:
                if data_type not in SHARED_DATA_TYPES:
                    raise ValueError(f"Invalid shared data type '{data_type}'. Must be one of: {SHARED_DATA_TYPES}")
        
        return data
    
    @staticmethod
    def validate_photo_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate photo data before database operations"""
        if 'mime_type' in data:
            if data['mime_type'] not in ALLOWED_IMAGE_TYPES:
                raise ValueError(f"Unsupported file type. Allowed types: {ALLOWED_IMAGE_TYPES}")
        
        if 'file_size' in data:
            if not isinstance(data['file_size'], int) or data['file_size'] <= 0:
                raise ValueError("File size must be a positive integer")
            if data['file_size'] > MAX_FILE_SIZE:
                raise ValueError(f"File size cannot exceed {MAX_FILE_SIZE} bytes")
        
        return data


# Database Operation Helpers
class DatabaseHelpers:
    """Helper functions for database operations"""
    
    @staticmethod
    def build_user_query(user_id: str, additional_filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Build a query for user-specific documents"""
        query = {"user_id": ObjectId(user_id)}
        if additional_filters:
            query.update(additional_filters)
        return query
    
    @staticmethod
    def build_date_range_query(start_date: datetime = None, end_date: datetime = None, field_name: str = "created_at") -> Dict[str, Any]:
        """Build a date range query"""
        if not start_date and not end_date:
            return {}
        
        date_filter = {}
        if start_date:
            date_filter["$gte"] = start_date
        if end_date:
            date_filter["$lte"] = end_date
        
        return {field_name: date_filter}
    
    @staticmethod
    def build_soft_delete_query(include_deleted: bool = False) -> Dict[str, Any]:
        """Build a query that handles soft deletes"""
        if include_deleted:
            return {}
        return {"deleted_at": {"$exists": False}}
    
    @staticmethod
    def prepare_update_data(data: Dict[str, Any], exclude_none: bool = True) -> Dict[str, Any]:
        """Prepare data for MongoDB update operations"""
        if exclude_none:
            data = {k: v for k, v in data.items() if v is not None}
        
        # Always update the updated_at timestamp
        data["updated_at"] = datetime.now(timezone.utc)
        
        return prepare_for_mongo(data)
    
    @staticmethod
    def prepare_soft_delete() -> Dict[str, Any]:
        """Prepare data for soft delete operation"""
        return {
            "deleted_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }