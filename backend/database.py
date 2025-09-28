from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise ValueError("MONGODB_URI environment variable is required")

# Simple client configuration for MongoDB Atlas
client = AsyncIOMotorClient(MONGODB_URI)
db = client.health_journey

def get_database():
    return db