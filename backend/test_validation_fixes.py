#!/usr/bin/env python3
"""
Test script to verify the authentication validation fixes
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_signup_validation():
    """Test various signup validation scenarios"""
    print("🧪 Testing Signup Validation Fixes")
    print("=" * 50)
    
    # Test cases
    test_cases = [
        {
            "name": "Short Password",
            "data": {
                "email": "test@example.com",
                "password": "123",  # Too short
                "name": "John Doe"
            },
            "expected_status": 422
        },
        {
            "name": "Empty Name",
            "data": {
                "email": "test2@example.com", 
                "password": "validpassword123",
                "name": ""  # Empty name
            },
            "expected_status": 422
        },
        {
            "name": "Whitespace-only Name",
            "data": {
                "email": "test3@example.com",
                "password": "validpassword123", 
                "name": "   "  # Only whitespace
            },
            "expected_status": 422
        },
        {
            "name": "Valid Data",
            "data": {
                "email": "validuser@example.com",
                "password": "validpassword123",
                "name": "John Doe"
            },
            "expected_status": 200
        },
        {
            "name": "Name with Leading/Trailing Spaces",
            "data": {
                "email": "spaceuser@example.com",
                "password": "validpassword123",
                "name": "  Jane Smith  "  # Should be trimmed
            },
            "expected_status": 200
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}. Testing: {test_case['name']}")
        print(f"   Data: {test_case['data']}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/signup",
                json=test_case['data'],
                headers={"Content-Type": "application/json"}
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == test_case['expected_status']:
                print("   ✅ Expected status code")
            else:
                print(f"   ❌ Expected {test_case['expected_status']}, got {response.status_code}")
            
            # Print response details
            try:
                response_data = response.json()
                if response.status_code == 422:
                    print(f"   Error Details: {json.dumps(response_data, indent=2)}")
                elif response.status_code == 200:
                    print(f"   Success: User created with name '{response_data.get('user', {}).get('name', 'N/A')}'")
            except:
                print(f"   Response Text: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("   ❌ Connection Error: Make sure the backend server is running")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")

def test_duplicate_user():
    """Test duplicate user creation"""
    print(f"\n\n🧪 Testing Duplicate User Creation")
    print("=" * 50)
    
    # First, create a user
    user_data = {
        "email": "duplicate@example.com",
        "password": "validpassword123",
        "name": "Duplicate User"
    }
    
    print("1. Creating initial user...")
    try:
        response1 = requests.post(
            f"{BASE_URL}/signup",
            json=user_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response1.status_code}")
        
        # Try to create the same user again
        print("2. Attempting to create duplicate user...")
        response2 = requests.post(
            f"{BASE_URL}/signup", 
            json=user_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response2.status_code}")
        
        if response2.status_code == 422:
            print("   ✅ Correctly rejected duplicate user")
            try:
                error_data = response2.json()
                print(f"   Error Details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"   Response: {response2.text}")
        else:
            print("   ❌ Should have rejected duplicate user")
            
    except requests.exceptions.ConnectionError:
        print("   ❌ Connection Error: Make sure the backend server is running")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting Authentication Validation Tests")
    print("Make sure the backend server is running on http://localhost:8000")
    print()
    
    test_signup_validation()
    test_duplicate_user()
    
    print(f"\n\n✅ Testing Complete!")
    print("Check the results above to verify the validation fixes are working correctly.")