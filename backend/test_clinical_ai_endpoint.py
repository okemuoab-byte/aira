#!/usr/bin/env python3
"""
Test script to trigger the clinical AI endpoint and capture the error
"""
import asyncio
import httpx
import json
from datetime import datetime

async def test_clinical_ai_endpoint():
    """Test the clinical AI comprehensive assessment endpoint"""
    
    # Sample test data similar to what the frontend sends
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
    
    url = "http://localhost:8000/api/v1/clinical-ai/comprehensive-assessment"
    
    # Create a mock auth token for testing
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer test_token"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            print(f"Testing endpoint: {url}")
            print(f"Request data: {json.dumps(test_data, indent=2)}")
            print("-" * 50)
            
            response = await client.post(url, json=test_data, headers=headers)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            print(f"Response Body: {response.text}")
            
            if response.status_code != 200:
                print(f"ERROR: Request failed with status {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"Error Details: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"Raw Error Response: {response.text}")
            else:
                print("SUCCESS: Request completed successfully")
                
    except Exception as e:
        print(f"Exception occurred: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_clinical_ai_endpoint())