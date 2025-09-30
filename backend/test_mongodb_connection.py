#!/usr/bin/env python3

import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment variables
load_dotenv()

async def test_mongodb_connection():
    """Test MongoDB connection directly"""
    MONGODB_URI = os.getenv("MONGODB_URI")
    
    if not MONGODB_URI:
        print("❌ MONGODB_URI environment variable not found")
        return False
    
    print(f"🔗 Attempting to connect to MongoDB...")
    print(f"URI: {MONGODB_URI[:50]}...")  # Show first 50 chars for security
    
    try:
        # Create MongoDB client
        client = AsyncIOMotorClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=20000,
            socketTimeoutMS=30000,
            maxPoolSize=10,
            minPoolSize=1,
            maxIdleTimeMS=30000,
            retryWrites=True,
            w="majority",
            tls=True,
            tlsAllowInvalidCertificates=False,
            tlsAllowInvalidHostnames=False,
            authSource="admin"
        )
        
        # Test the connection
        await client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # Get database info
        db = client["health_journey"]
        collections = await db.list_collection_names()
        print(f"📊 Available collections: {collections}")
        
        # Close connection
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_mongodb_connection())
    exit(0 if success else 1)