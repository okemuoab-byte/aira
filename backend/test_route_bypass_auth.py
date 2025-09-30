#!/usr/bin/env python3
"""
Test the clinical AI route by temporarily bypassing authentication
"""
import asyncio
import httpx
import json
from datetime import datetime

# Test data
test_data = {
    "symptoms": [
        {
            "body_part": "head",
            "type": "headache",
            "intensity": 7,
            "duration": "2 hours",
            "onset": "sudden",
            "notes": "Sharp pain on left side",
            "timestamp": datetime.utcnow().isoformat()
        }
    ],
    "patient_profile": {
        "age": 35,
        "gender": "female",
        "weight": "65kg",
        "height": "165cm"
    },
    "medical_history": ["migraine", "hypertension"],
    "current_medications": ["ibuprofen", "lisinopril"]
}

async def test_with_mock_auth():
    """Test by temporarily modifying the route to bypass auth"""
    
    print("Testing clinical AI endpoint with different approaches...")
    print("=" * 60)
    
    # Test 1: Try without auth header
    print("1. Testing without authentication...")
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "http://localhost:8000/api/v1/clinical-ai/comprehensive-assessment",
                json=test_data
            )
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 2: Try with empty auth header
    print("\n2. Testing with empty Bearer token...")
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "http://localhost:8000/api/v1/clinical-ai/comprehensive-assessment",
                json=test_data,
                headers={"Authorization": "Bearer "}
            )
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 3: Try with malformed token
    print("\n3. Testing with malformed token...")
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "http://localhost:8000/api/v1/clinical-ai/comprehensive-assessment",
                json=test_data,
                headers={"Authorization": "Bearer invalid.token.here"}
            )
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
    except Exception as e:
        print(f"   Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_with_mock_auth())