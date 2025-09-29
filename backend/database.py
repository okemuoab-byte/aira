import os
import logging
from datetime import datetime
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# MongoDB Configuration
MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = "health_journey"

# Validate environment variables
if not MONGODB_URI:
    raise ValueError("MONGODB_URI environment variable is required")

# Global client and database instances
client: Optional[AsyncIOMotorClient] = None
db: Optional[AsyncIOMotorDatabase] = None


async def connect_to_mongodb():
    """Initialize MongoDB connection and setup database"""
    global client, db
    
    try:
        logger.info("Connecting to MongoDB...")
        
        # Create MongoDB client with proper SSL configuration for Atlas
        client = AsyncIOMotorClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=10000,  # 10 second timeout
            connectTimeoutMS=20000,          # 20 second connection timeout
            socketTimeoutMS=30000,           # 30 second socket timeout
            maxPoolSize=10,                  # Maximum connection pool size
            minPoolSize=1,                   # Minimum connection pool size
            maxIdleTimeMS=30000,            # Close connections after 30 seconds of inactivity
            retryWrites=True,               # Enable retryable writes
            w="majority",                   # Write concern: majority
            tls=True,                       # Enable TLS/SSL
            tlsAllowInvalidCertificates=False,  # Validate certificates
            tlsAllowInvalidHostnames=False,     # Validate hostnames
            authSource="admin"              # Authentication database
        )
        
        # Get database instance
        db = client[DATABASE_NAME]
        
        # Test the connection
        await client.admin.command('ping')
        logger.info(f"Successfully connected to MongoDB database: {DATABASE_NAME}")
        
        # Initialize database collections and indexes
        await initialize_database()
        
        return db
        
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise ConnectionError(f"Could not connect to MongoDB: {e}")
    except Exception as e:
        logger.error(f"Unexpected error connecting to MongoDB: {e}")
        raise


async def close_mongodb_connection():
    """Close MongoDB connection"""
    global client
    
    if client:
        logger.info("Closing MongoDB connection...")
        client.close()
        client = None
        logger.info("MongoDB connection closed")


async def initialize_database():
    """Initialize database collections and create indexes"""
    if db is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongodb() first.")
    
    logger.info("Initializing database collections and indexes...")
    
    try:
        # Create indexes for users collection
        await db.users.create_index("email", unique=True)
        await db.users.create_index("created_at")
        await db.users.create_index("updated_at")
        
        # Create indexes for symptoms collection
        await db.symptoms.create_index([("user_id", 1), ("timestamp", -1)])
        await db.symptoms.create_index([("user_id", 1), ("body_part_id", 1)])
        await db.symptoms.create_index([("user_id", 1), ("type", 1)])
        await db.symptoms.create_index([("user_id", 1), ("intensity", 1)])
        await db.symptoms.create_index("created_at")
        await db.symptoms.create_index("deleted_at", sparse=True)  # For soft deletes
        
        # Create indexes for medications collection
        await db.medications.create_index([("user_id", 1), ("created_at", -1)])
        await db.medications.create_index([("user_id", 1), ("name", 1)])
        await db.medications.create_index([("user_id", 1), ("start_date", 1)])
        await db.medications.create_index([("user_id", 1), ("end_date", 1)])
        await db.medications.create_index([("user_id", 1), ("reminder_enabled", 1)])
        
        # Create indexes for dose_logs collection
        await db.dose_logs.create_index([("user_id", 1), ("medication_id", 1), ("scheduled_time", -1)])
        await db.dose_logs.create_index([("user_id", 1), ("status", 1)])
        await db.dose_logs.create_index("created_at")
        
        # Create indexes for healthcare visits collection
        await db.visits.create_index([("user_id", 1), ("date", -1)])
        await db.visits.create_index([("user_id", 1), ("provider_type", 1)])
        await db.visits.create_index([("user_id", 1), ("follow_up_required", 1)])
        await db.visits.create_index("created_at")
        
        # Create indexes for family members collection
        await db.family_members.create_index([("user_id", 1), ("email", 1)])
        await db.family_members.create_index([("user_id", 1), ("invite_status", 1)])
        await db.family_members.create_index([("user_id", 1), ("access_level", 1)])
        await db.family_members.create_index("invited_date")
        
        # Create indexes for photos collection
        await db.photos.create_index([("user_id", 1), ("timestamp", -1)])
        await db.photos.create_index([("user_id", 1), ("symptom_id", 1)])
        await db.photos.create_index("created_at")
        
        # Create indexes for share settings collection
        await db.share_settings.create_index("user_id", unique=True)
        await db.share_settings.create_index("updated_at")
        
        logger.info("Database indexes created successfully")
        
        # Log collection information
        collections = await db.list_collection_names()
        logger.info(f"Available collections: {collections}")
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise


async def get_database() -> AsyncIOMotorDatabase:
    """Dependency to get database instance"""
    global db
    
    if db is None:
        logger.warning("Database not initialized, attempting to connect...")
        await connect_to_mongodb()
    
    if db is None:
        raise RuntimeError("Failed to initialize database connection")
    
    return db


async def health_check() -> dict:
    """Check database connection health"""
    try:
        if not client:
            return {
                "status": "disconnected",
                "message": "No database connection",
                "timestamp": datetime.utcnow()
            }
        
        # Ping the database
        await client.admin.command('ping')
        
        # Get server info
        server_info = await client.server_info()
        
        # Get database stats
        stats = await db.command("dbStats")
        
        return {
            "status": "healthy",
            "message": "Database connection is healthy",
            "server_version": server_info.get("version"),
            "database_name": DATABASE_NAME,
            "collections_count": stats.get("collections", 0),
            "data_size": stats.get("dataSize", 0),
            "storage_size": stats.get("storageSize", 0),
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "message": f"Database health check failed: {str(e)}",
            "timestamp": datetime.utcnow()
        }


# Collection name constants for consistency
class Collections:
    USERS = "users"
    SYMPTOMS = "symptoms"
    MEDICATIONS = "medications"
    DOSE_LOGS = "dose_logs"
    VISITS = "visits"
    FAMILY_MEMBERS = "family_members"
    PHOTOS = "photos"
    SHARE_SETTINGS = "share_settings"


# Database utility functions
async def ensure_indexes():
    """Ensure all required indexes exist (can be called periodically)"""
    await initialize_database()


async def get_collection_stats() -> dict:
    """Get statistics for all collections"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    stats = {}
    collections = [
        Collections.USERS,
        Collections.SYMPTOMS,
        Collections.MEDICATIONS,
        Collections.DOSE_LOGS,
        Collections.VISITS,
        Collections.FAMILY_MEMBERS,
        Collections.PHOTOS,
        Collections.SHARE_SETTINGS
    ]
    
    for collection_name in collections:
        try:
            collection = db[collection_name]
            count = await collection.count_documents({})
            stats[collection_name] = {
                "document_count": count,
                "indexes": await collection.list_indexes().to_list(length=None)
            }
        except Exception as e:
            stats[collection_name] = {"error": str(e)}
    
    return stats


# Database CRUD Operations
from typing import Dict, List, Optional, Any
from bson import ObjectId
from datetime import datetime, timezone
from pymongo.errors import DuplicateKeyError
from models import (
    UserInDB, SymptomInDB, MedicationInDB, DoseLogInDB,
    HealthcareVisitInDB, FamilyMemberInDB, PhotoInDB, ShareSettingsInDB,
    prepare_for_mongo, prepare_from_mongo, DatabaseHelpers
)

# User Operations
async def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new user"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    try:
        # Prepare user data for MongoDB
        user_doc = prepare_for_mongo(user_data)
        user_doc["created_at"] = datetime.now(timezone.utc)
        user_doc["updated_at"] = datetime.now(timezone.utc)
        
        result = await db.users.insert_one(user_doc)
        
        # Retrieve the created user
        created_user = await db.users.find_one({"_id": result.inserted_id})
        return prepare_from_mongo(created_user)
        
    except DuplicateKeyError:
        raise ValueError("User with this email already exists")
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise

async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    user = await db.users.find_one({"email": email})
    return prepare_from_mongo(user) if user else None

async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user by ID"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    if not ObjectId.is_valid(user_id):
        return None
        
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    return prepare_from_mongo(user) if user else None

async def update_user(user_id: str, update_data: Dict[str, Any]) -> bool:
    """Update user data"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    if not ObjectId.is_valid(user_id):
        return False
    
    update_doc = DatabaseHelpers.prepare_update_data(update_data)
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_doc}
    )
    return result.modified_count > 0

async def delete_user(user_id: str) -> bool:
    """Soft delete user"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    if not ObjectId.is_valid(user_id):
        return False
    
    soft_delete_data = DatabaseHelpers.prepare_soft_delete()
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": soft_delete_data}
    )
    return result.modified_count > 0

# Symptom Operations
async def create_symptom(user_id: str, symptom_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new symptom"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    symptom_doc = prepare_for_mongo(symptom_data)
    symptom_doc["user_id"] = ObjectId(user_id)
    symptom_doc["created_at"] = datetime.now(timezone.utc)
    symptom_doc["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.symptoms.insert_one(symptom_doc)
    created_symptom = await db.symptoms.find_one({"_id": result.inserted_id})
    return prepare_from_mongo(created_symptom)

async def get_symptoms(user_id: str, filters: Dict[str, Any] = None, limit: int = 100) -> List[Dict[str, Any]]:
    """Get user's symptoms with optional filtering"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    query = DatabaseHelpers.build_user_query(user_id)
    query.update(DatabaseHelpers.build_soft_delete_query())
    
    if filters:
        query.update(filters)
    
    cursor = db.symptoms.find(query).sort("timestamp", -1).limit(limit)
    symptoms = await cursor.to_list(length=limit)
    return [prepare_from_mongo(symptom) for symptom in symptoms]

async def update_symptom(symptom_id: str, user_id: str, update_data: Dict[str, Any]) -> bool:
    """Update symptom"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    if not ObjectId.is_valid(symptom_id):
        return False
    
    update_doc = DatabaseHelpers.prepare_update_data(update_data)
    result = await db.symptoms.update_one(
        {"_id": ObjectId(symptom_id), "user_id": ObjectId(user_id)},
        {"$set": update_doc}
    )
    return result.modified_count > 0

async def delete_symptom(symptom_id: str, user_id: str) -> bool:
    """Soft delete symptom"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    if not ObjectId.is_valid(symptom_id):
        return False
    
    soft_delete_data = DatabaseHelpers.prepare_soft_delete()
    result = await db.symptoms.update_one(
        {"_id": ObjectId(symptom_id), "user_id": ObjectId(user_id)},
        {"$set": soft_delete_data}
    )
    return result.modified_count > 0

# Medication Operations
async def create_medication(user_id: str, medication_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new medication"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    medication_doc = prepare_for_mongo(medication_data)
    medication_doc["user_id"] = ObjectId(user_id)
    medication_doc["created_at"] = datetime.now(timezone.utc)
    medication_doc["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.medications.insert_one(medication_doc)
    created_medication = await db.medications.find_one({"_id": result.inserted_id})
    return prepare_from_mongo(created_medication)

async def get_medications(user_id: str, active_only: bool = True, limit: int = 100) -> List[Dict[str, Any]]:
    """Get user's medications"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    query = DatabaseHelpers.build_user_query(user_id)
    
    if active_only:
        now = datetime.now(timezone.utc)
        query["$or"] = [
            {"end_date": None},
            {"end_date": {"$gte": now}}
        ]
    
    cursor = db.medications.find(query).sort("created_at", -1).limit(limit)
    medications = await cursor.to_list(length=limit)
    return [prepare_from_mongo(medication) for medication in medications]

async def update_medication(medication_id: str, user_id: str, update_data: Dict[str, Any]) -> bool:
    """Update medication"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    if not ObjectId.is_valid(medication_id):
        return False
    
    update_doc = DatabaseHelpers.prepare_update_data(update_data)
    result = await db.medications.update_one(
        {"_id": ObjectId(medication_id), "user_id": ObjectId(user_id)},
        {"$set": update_doc}
    )
    return result.modified_count > 0

async def delete_medication(medication_id: str, user_id: str) -> bool:
    """Delete medication"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    if not ObjectId.is_valid(medication_id):
        return False
    
    result = await db.medications.delete_one(
        {"_id": ObjectId(medication_id), "user_id": ObjectId(user_id)}
    )
    return result.deleted_count > 0

async def log_dose(user_id: str, dose_data: Dict[str, Any]) -> Dict[str, Any]:
    """Log a medication dose"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    dose_doc = prepare_for_mongo(dose_data)
    dose_doc["user_id"] = ObjectId(user_id)
    dose_doc["created_at"] = datetime.now(timezone.utc)
    
    result = await db.dose_logs.insert_one(dose_doc)
    created_dose = await db.dose_logs.find_one({"_id": result.inserted_id})
    return prepare_from_mongo(created_dose)

# Healthcare Visit Operations
async def create_visit(user_id: str, visit_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new healthcare visit"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    visit_doc = prepare_for_mongo(visit_data)
    visit_doc["user_id"] = ObjectId(user_id)
    visit_doc["created_at"] = datetime.now(timezone.utc)
    visit_doc["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.healthcare_visits.insert_one(visit_doc)
    created_visit = await db.healthcare_visits.find_one({"_id": result.inserted_id})
    return prepare_from_mongo(created_visit)

async def get_visits(user_id: str, filters: Dict[str, Any] = None, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
    """Get user's healthcare visits"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    query = DatabaseHelpers.build_user_query(user_id)
    
    if filters:
        query.update(filters)
    
    cursor = db.healthcare_visits.find(query).sort("date", -1).skip(skip).limit(limit)
    visits = await cursor.to_list(length=limit)
    return [prepare_from_mongo(visit) for visit in visits]

async def update_visit(visit_id: str, user_id: str, update_data: Dict[str, Any]) -> bool:
    """Update healthcare visit"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    if not ObjectId.is_valid(visit_id):
        return False
    
    update_doc = DatabaseHelpers.prepare_update_data(update_data)
    result = await db.healthcare_visits.update_one(
        {"_id": ObjectId(visit_id), "user_id": ObjectId(user_id)},
        {"$set": update_doc}
    )
    return result.modified_count > 0

async def delete_visit(visit_id: str, user_id: str) -> bool:
    """Delete healthcare visit"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    if not ObjectId.is_valid(visit_id):
        return False
    
    result = await db.healthcare_visits.delete_one(
        {"_id": ObjectId(visit_id), "user_id": ObjectId(user_id)}
    )
    return result.deleted_count > 0

# Family Member Operations
async def create_family_member(user_id: str, member_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new family member"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    member_doc = prepare_for_mongo(member_data)
    member_doc["user_id"] = ObjectId(user_id)
    member_doc["created_at"] = datetime.now(timezone.utc)
    member_doc["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.family_members.insert_one(member_doc)
    created_member = await db.family_members.find_one({"_id": result.inserted_id})
    return prepare_from_mongo(created_member)

async def get_family_members(user_id: str) -> List[Dict[str, Any]]:
    """Get user's family members"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    query = DatabaseHelpers.build_user_query(user_id)
    cursor = db.family_members.find(query)
    members = await cursor.to_list(length=None)
    return [prepare_from_mongo(member) for member in members]

async def update_sharing_settings(user_id: str, settings_data: Dict[str, Any]) -> Dict[str, Any]:
    """Update or create sharing settings"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    settings_doc = prepare_for_mongo(settings_data)
    settings_doc["user_id"] = ObjectId(user_id)
    settings_doc["updated_at"] = datetime.now(timezone.utc)
    
    # Upsert operation
    result = await db.share_settings.update_one(
        {"user_id": ObjectId(user_id)},
        {"$set": settings_doc},
        upsert=True
    )
    
    # Return the updated/created settings
    settings = await db.share_settings.find_one({"user_id": ObjectId(user_id)})
    return prepare_from_mongo(settings)

# Photo Operations
async def create_photo(user_id: str, photo_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new photo record"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    photo_doc = prepare_for_mongo(photo_data)
    photo_doc["user_id"] = ObjectId(user_id)
    photo_doc["created_at"] = datetime.now(timezone.utc)
    photo_doc["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.photos.insert_one(photo_doc)
    created_photo = await db.photos.find_one({"_id": result.inserted_id})
    return prepare_from_mongo(created_photo)

async def get_photos(user_id: str, filters: Dict[str, Any] = None, limit: int = 50) -> List[Dict[str, Any]]:
    """Get user's photos"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    query = DatabaseHelpers.build_user_query(user_id)
    query.update(DatabaseHelpers.build_soft_delete_query())
    
    if filters:
        query.update(filters)
    
    cursor = db.photos.find(query).sort("created_at", -1).limit(limit)
    photos = await cursor.to_list(length=limit)
    return [prepare_from_mongo(photo) for photo in photos]

async def delete_photo(photo_id: str, user_id: str) -> bool:
    """Delete photo"""
    if not db:
        raise RuntimeError("Database not initialized")
    
    if not ObjectId.is_valid(photo_id):
        return False
    
    result = await db.photos.delete_one(
        {"_id": ObjectId(photo_id), "user_id": ObjectId(user_id)}
    )
    return result.deleted_count > 0

# Backward compatibility
def get_database_sync():
    """Synchronous version for backward compatibility (deprecated)"""
    logger.warning("get_database_sync is deprecated, use get_database() instead")
    return db