#!/usr/bin/env python3
"""
Test the clinical AI endpoint with a valid JWT token
"""
import asyncio
import httpx
import json
from datetime import datetime, timedelta
from jose import jwt

# JWT settings (same as in auth.py)
SECRET_KEY = "your-super-secret-jwt-key-here"
ALGORITHM = "HS256"

def create_test_token():
    """Create a test JWT token"""
    payload = {
        "sub": "test@example.com",
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def test_with_valid_token():
    """Test the endpoint with a valid JWT token"""
    
    print("Testing clinical AI endpoint with valid authentication...")
    print("=" * 60)
    
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
    
    # Create a valid token
    token = create_test_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            print("Making request with valid JWT token...")
            response = await client.post(
                "http://localhost:8000/api/v1/clinical-ai/comprehensive-assessment",
                json=test_data,
                headers=headers
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                print("✅ SUCCESS: Endpoint is working correctly!")
                data = response.json()
                if data.get('success'):
                    assessment = data.get('assessment', {})
                    print(f"Assessment ID: {assessment.get('assessment_id', 'N/A')}")
                    print(f"Urgency Level: {assessment.get('urgency_level', 'N/A')}")
                    print(f"Risk Level: {assessment.get('risk_level', 'N/A')}")
                else:
                    print(f"Assessment failed: {data.get('error', 'Unknown error')}")
            else:
                print(f"❌ ERROR: Status {response.status_code}")
                print(f"Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Exception: {type(e).__name__}: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_with_valid_token())