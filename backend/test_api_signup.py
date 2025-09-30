#!/usr/bin/env python3
"""
Test the actual signup API endpoint to identify 422 errors
"""
import asyncio
import json
import aiohttp
import sys

async def test_signup_api():
    """Test the signup API endpoint directly"""
    
    base_url = "http://localhost:8000/api/v1"
    
    # Test cases that match what the frontend might send
    test_cases = [
        {
            "name": "Frontend-like valid data",
            "data": {
                "email": "test@example.com",
                "password": "password123",
                "name": "Test User"
            }
        },
        {
            "name": "Frontend validation mismatch - short password",
            "data": {
                "email": "test@example.com", 
                "password": "short",  # Frontend allows 6+ chars, backend requires 8+
                "name": "Test User"
            }
        },
        {
            "name": "Frontend validation mismatch - empty name",
            "data": {
                "email": "test@example.com",
                "password": "password123",
                "name": ""  # Frontend might allow empty, backend requires min_length=1
            }
        },
        {
            "name": "Case sensitivity test",
            "data": {
                "Email": "test@example.com",  # Wrong case
                "Password": "password123",    # Wrong case
                "Name": "Test User"          # Wrong case
            }
        }
    ]
    
    async with aiohttp.ClientSession() as session:
        for test_case in test_cases:
            print(f"\n📝 Testing: {test_case['name']}")
            print(f"   Data: {json.dumps(test_case['data'], indent=2)}")
            
            try:
                async with session.post(
                    f"{base_url}/auth/signup",
                    json=test_case['data'],
                    headers={"Content-Type": "application/json"}
                ) as response:
                    
                    print(f"   📊 Status Code: {response.status}")
                    
                    response_text = await response.text()
                    
                    if response.status == 200:
                        print(f"   ✅ Success!")
                        response_data = json.loads(response_text)
                        print(f"   👤 User created: {response_data.get('user', {}).get('email', 'N/A')}")
                        
                        # Clean up - delete the test user if created
                        if 'user' in response_data:
                            print(f"   🧹 Note: Test user should be cleaned up manually")
                    
                    elif response.status == 422:
                        print(f"   ❌ Validation Error (422):")
                        try:
                            error_data = json.loads(response_text)
                            print(f"   📋 Error details: {json.dumps(error_data, indent=6)}")
                        except:
                            print(f"   📋 Raw error: {response_text}")
                    
                    elif response.status == 400:
                        print(f"   ❌ Bad Request (400):")
                        try:
                            error_data = json.loads(response_text)
                            print(f"   📋 Error details: {json.dumps(error_data, indent=6)}")
                        except:
                            print(f"   📋 Raw error: {response_text}")
                    
                    else:
                        print(f"   ❌ Unexpected status: {response.status}")
                        print(f"   📋 Response: {response_text}")
                        
            except Exception as e:
                print(f"   💥 Request failed: {type(e).__name__}: {e}")

async def test_health_check():
    """Test if the API is running"""
    print("🔍 Testing API health check...")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://localhost:8000/api/v1/healthz") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"   ✅ API is running: {data.get('message', 'N/A')}")
                    print(f"   🗄️  Database connected: {data.get('database_connected', False)}")
                    return True
                else:
                    print(f"   ❌ API health check failed: {response.status}")
                    return False
    except Exception as e:
        print(f"   💥 Cannot connect to API: {type(e).__name__}: {e}")
        return False

async def main():
    """Main test function"""
    print("🚀 Starting API signup tests...\n")
    
    # First check if API is running
    api_running = await test_health_check()
    
    if not api_running:
        print("\n❌ API is not running or not accessible. Please start the backend server.")
        return
    
    await test_signup_api()
    
    print("\n✅ API tests completed!")

if __name__ == "__main__":
    asyncio.run(main())