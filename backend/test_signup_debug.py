#!/usr/bin/env python3
"""
Debug script to test the signup endpoint and identify 422 validation errors
"""
import asyncio
import json
import sys
from datetime import datetime
from pydantic import ValidationError

# Add the backend directory to the path
sys.path.append('.')

from models import SignupRequest
from auth import create_user
from database import connect_to_mongodb

async def test_signup_validation():
    """Test signup validation with various data combinations"""
    
    print("🔍 Testing SignupRequest validation...")
    
    # Test cases that might cause 422 errors
    test_cases = [
        {
            "name": "Valid signup data",
            "data": {
                "email": "test@example.com",
                "password": "password123",
                "name": "Test User"
            }
        },
        {
            "name": "Missing name field",
            "data": {
                "email": "test@example.com", 
                "password": "password123"
            }
        },
        {
            "name": "Empty name field",
            "data": {
                "email": "test@example.com",
                "password": "password123", 
                "name": ""
            }
        },
        {
            "name": "Short password (< 8 chars)",
            "data": {
                "email": "test@example.com",
                "password": "short",
                "name": "Test User"
            }
        },
        {
            "name": "Invalid email format",
            "data": {
                "email": "invalid-email",
                "password": "password123",
                "name": "Test User"
            }
        },
        {
            "name": "Missing password field",
            "data": {
                "email": "test@example.com",
                "name": "Test User"
            }
        },
        {
            "name": "Extra unexpected field",
            "data": {
                "email": "test@example.com",
                "password": "password123",
                "name": "Test User",
                "extra_field": "unexpected"
            }
        }
    ]
    
    for test_case in test_cases:
        print(f"\n📝 Testing: {test_case['name']}")
        print(f"   Data: {json.dumps(test_case['data'], indent=2)}")
        
        try:
            # Test Pydantic validation
            signup_request = SignupRequest(**test_case['data'])
            print(f"   ✅ Pydantic validation passed")
            print(f"   📋 Validated data: {signup_request.dict()}")
            
        except ValidationError as e:
            print(f"   ❌ Pydantic validation failed:")
            for error in e.errors():
                print(f"      - Field: {error['loc']}, Error: {error['msg']}, Type: {error['type']}")
        except Exception as e:
            print(f"   💥 Unexpected error: {type(e).__name__}: {e}")

async def test_database_user_creation():
    """Test database user creation"""
    print("\n🔍 Testing database user creation...")
    
    try:
        # Connect to database
        db = await connect_to_mongodb()
        print("   ✅ Database connection successful")
        
        # Test user creation with valid data
        test_user_data = {
            "email": f"debug_test_{datetime.now().timestamp()}@example.com",
            "password": "password123",
            "name": "Debug Test User"
        }
        
        print(f"   📝 Creating user with data: {json.dumps(test_user_data, indent=2)}")
        
        user_doc = await create_user(db, test_user_data)
        print(f"   ✅ User created successfully: {user_doc['email']}")
        
        # Clean up - delete the test user
        await db.users.delete_one({"email": test_user_data["email"]})
        print(f"   🧹 Test user cleaned up")
        
    except Exception as e:
        print(f"   ❌ Database user creation failed: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

async def main():
    """Main test function"""
    print("🚀 Starting signup debug tests...\n")
    
    await test_signup_validation()
    await test_database_user_creation()
    
    print("\n✅ Debug tests completed!")

if __name__ == "__main__":
    asyncio.run(main())