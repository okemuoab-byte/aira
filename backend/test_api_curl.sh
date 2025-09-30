#!/bin/bash

echo "🚀 Testing signup API endpoint with curl..."

# Test 1: Valid signup data
echo -e "\n📝 Test 1: Valid signup data"
curl -X POST "http://localhost:8000/api/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test1@example.com",
    "password": "password123",
    "name": "Test User 1"
  }' \
  -w "\nStatus Code: %{http_code}\n" \
  -s

# Test 2: Short password (frontend allows 6+, backend requires 8+)
echo -e "\n📝 Test 2: Short password (6 chars)"
curl -X POST "http://localhost:8000/api/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "short1",
    "name": "Test User 2"
  }' \
  -w "\nStatus Code: %{http_code}\n" \
  -s

# Test 3: Empty name
echo -e "\n📝 Test 3: Empty name"
curl -X POST "http://localhost:8000/api/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test3@example.com",
    "password": "password123",
    "name": ""
  }' \
  -w "\nStatus Code: %{http_code}\n" \
  -s

# Test 4: Missing name field
echo -e "\n📝 Test 4: Missing name field"
curl -X POST "http://localhost:8000/api/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test4@example.com",
    "password": "password123"
  }' \
  -w "\nStatus Code: %{http_code}\n" \
  -s

# Test 5: Invalid email
echo -e "\n📝 Test 5: Invalid email"
curl -X POST "http://localhost:8000/api/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "password123",
    "name": "Test User 5"
  }' \
  -w "\nStatus Code: %{http_code}\n" \
  -s

echo -e "\n✅ API tests completed!"