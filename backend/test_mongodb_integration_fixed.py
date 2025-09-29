#!/usr/bin/env python3

import asyncio
import json
import requests
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List
import uuid

# Test configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

class MongoDBIntegrationTester:
    def __init__(self):
        self.test_results = []
        self.test_user_email = f"test_user_{uuid.uuid4().hex[:8]}@example.com"
        self.test_user_password = "testpassword123"
        self.access_token = None
        self.user_id = None
        self.created_resources = {
            "symptoms": [],
            "medications": [],
            "visits": [],
            "photos": []
        }
    
    def log_test(self, test_name: str, success: bool, details: str = "", data: Any = None):
        """Log test result"""
        result = {
            "test_name": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "data": data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and data:
            print(f"   Error Data: {data}")
        print()
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None, files: Dict = None) -> Dict:
        """Make HTTP request with error handling"""
        url = f"{API_BASE}{endpoint}"
        
        # Add authorization header if token exists
        if self.access_token and headers is None:
            headers = {"Authorization": f"Bearer {self.access_token}"}
        elif self.access_token and headers:
            headers["Authorization"] = f"Bearer {self.access_token}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, params=data)
            elif method.upper() == "POST":
                if files:
                    response = requests.post(url, data=data, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=headers)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            return {
                "status_code": response.status_code,
                "data": response.json() if response.content else {},
                "success": 200 <= response.status_code < 300
            }
        except Exception as e:
            return {
                "status_code": 0,
                "data": {"error": str(e)},
                "success": False
            }
    
    def test_database_health(self):
        """Test 1: Database Connection and Health"""
        print("🔍 Testing Database Health...")
        
        response = self.make_request("GET", "/healthz")
        
        if response["success"]:
            health_data = response["data"]
            if health_data.get("database_connected") and health_data.get("status") == "healthy":
                self.log_test("Database Health Check", True, "Database is healthy and connected")
            else:
                self.log_test("Database Health Check", False, "Database not properly connected", health_data)
        else:
            self.log_test("Database Health Check", False, "Health endpoint failed", response["data"])
    
    def test_user_authentication(self):
        """Test 2: User Authentication Operations"""
        print("🔍 Testing User Authentication...")
        
        # Test user signup
        signup_data = {
            "email": self.test_user_email,
            "password": self.test_user_password,
            "name": "Test User MongoDB"
        }
        
        response = self.make_request("POST", "/auth/signup", signup_data)
        
        if response["success"]:
            user_data = response["data"]
            self.access_token = user_data.get("access_token")
            self.user_id = user_data.get("user", {}).get("id")
            self.log_test("User Signup", True, f"User created with ID: {self.user_id}")
        else:
            self.log_test("User Signup", False, "Failed to create user", response["data"])
            return False
        
        # Test user login
        login_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response["success"]:
            login_user_data = response["data"]
            login_token = login_user_data.get("access_token")
            self.log_test("User Login", True, "Login successful")
            
            # Verify token works
            if login_token:
                self.access_token = login_token
        else:
            self.log_test("User Login", False, "Login failed", response["data"])
        
        # Test get current user profile
        response = self.make_request("GET", "/auth/me")
        
        if response["success"]:
            profile_data = response["data"]
            self.log_test("Get User Profile", True, f"Profile retrieved for: {profile_data.get('email')}")
        else:
            self.log_test("Get User Profile", False, "Failed to get profile", response["data"])
        
        return True
    
    def test_user_profile_operations(self):
        """Test 3: User Profile Management"""
        print("🔍 Testing User Profile Operations...")
        
        # Test get detailed profile
        response = self.make_request("GET", "/users/profile")
        
        if response["success"]:
            self.log_test("Get Detailed Profile", True, "Profile retrieved successfully")
        else:
            self.log_test("Get Detailed Profile", False, "Failed to get detailed profile", response["data"])
        
        # Test profile update
        update_data = {
            "name": "Updated Test User",
            "gender": "other",
            "height": {"value": 175, "unit": "cm"},
            "weight": {"value": 70, "unit": "kg"},
            "conditions": ["test condition"],
            "preferences": {"theme": "dark", "notifications": True}
        }
        
        response = self.make_request("PUT", "/users/profile", update_data)
        
        if response["success"]:
            updated_profile = response["data"]
            self.log_test("Update User Profile", True, "Profile updated successfully")
        else:
            self.log_test("Update User Profile", False, "Failed to update profile", response["data"])
    
    def test_symptom_operations(self):
        """Test 4: Symptom CRUD Operations"""
        print("🔍 Testing Symptom Operations...")
        
        # Test create symptom
        symptom_data = {
            "body_part_id": "head",
            "body_part_name": "Head",
            "type": "headache",
            "intensity": 7,
            "notes": "Severe headache after work",
            "coordinates": {"x": 100, "y": 50},
            "triggers": ["stress", "lack of sleep"],
            "treatments": ["rest", "water"]
        }
        
        response = self.make_request("POST", "/symptoms/", symptom_data)
        
        if response["success"]:
            created_symptom = response["data"]
            symptom_id = created_symptom.get("id")
            self.created_resources["symptoms"].append(symptom_id)
            self.log_test("Create Symptom", True, f"Symptom created with ID: {symptom_id}")
        else:
            self.log_test("Create Symptom", False, "Failed to create symptom", response["data"])
            return
        
        # Test get symptoms
        response = self.make_request("GET", "/symptoms/")
        
        if response["success"]:
            symptoms = response["data"]
            self.log_test("Get Symptoms", True, f"Retrieved {len(symptoms)} symptoms")
        else:
            self.log_test("Get Symptoms", False, "Failed to get symptoms", response["data"])
        
        # Test get specific symptom
        if self.created_resources["symptoms"]:
            symptom_id = self.created_resources["symptoms"][0]
            response = self.make_request("GET", f"/symptoms/{symptom_id}")
            
            if response["success"]:
                self.log_test("Get Specific Symptom", True, "Symptom retrieved successfully")
            else:
                self.log_test("Get Specific Symptom", False, "Failed to get specific symptom", response["data"])
        
        # Test update symptom
        if self.created_resources["symptoms"]:
            symptom_id = self.created_resources["symptoms"][0]
            update_data = {
                "intensity": 5,
                "notes": "Headache improved after rest"
            }
            
            response = self.make_request("PUT", f"/symptoms/{symptom_id}", update_data)
            
            if response["success"]:
                self.log_test("Update Symptom", True, "Symptom updated successfully")
            else:
                self.log_test("Update Symptom", False, "Failed to update symptom", response["data"])
    
    def test_medication_operations(self):
        """Test 5: Medication Operations"""
        print("🔍 Testing Medication Operations...")
        
        # Test create medication
        medication_data = {
            "name": "Test Medication",
            "dosage": "10mg",
            "frequency": "twice daily",
            "times": ["08:00", "20:00"],
            "start_date": datetime.now().isoformat(),
            "notes": "Take with food",
            "reminder_enabled": True,
            "side_effects": ["nausea", "dizziness"]
        }
        
        response = self.make_request("POST", "/medications/", medication_data)
        
        if response["success"]:
            created_medication = response["data"]
            medication_id = created_medication.get("id")
            self.created_resources["medications"].append(medication_id)
            self.log_test("Create Medication", True, f"Medication created with ID: {medication_id}")
        else:
            self.log_test("Create Medication", False, "Failed to create medication", response["data"])
            return
        
        # Test get medications
        response = self.make_request("GET", "/medications/")
        
        if response["success"]:
            medications = response["data"]
            self.log_test("Get Medications", True, f"Retrieved {len(medications)} medications")
        else:
            self.log_test("Get Medications", False, "Failed to get medications", response["data"])
        
        # Test dose logging
        if self.created_resources["medications"]:
            medication_id = self.created_resources["medications"][0]
            dose_data = {
                "medication_id": medication_id,
                "scheduled_time": datetime.now().isoformat(),
                "actual_time": datetime.now().isoformat(),
                "status": "taken",
                "notes": "Taken as scheduled"
            }
            
            response = self.make_request("POST", f"/medications/{medication_id}/doses", dose_data)
            
            if response["success"]:
                self.log_test("Log Medication Dose", True, "Dose logged successfully")
            else:
                self.log_test("Log Medication Dose", False, "Failed to log dose", response["data"])
        
        # Test medication suggestions (AI feature)
        response = self.make_request("GET", "/medications/suggestions", {"query": "aspirin"})
        
        if response["success"]:
            self.log_test("Medication Suggestions", True, "AI suggestions retrieved")
        else:
            self.log_test("Medication Suggestions", False, "Failed to get suggestions", response["data"])
    
    def test_healthcare_visit_operations(self):
        """Test 6: Healthcare Visit Operations"""
        print("🔍 Testing Healthcare Visit Operations...")
        
        # Test create visit
        visit_data = {
            "date": datetime.now().isoformat(),
            "provider_type": "GP",
            "provider_name": "Dr. Test Provider",
            "reason_for_visit": "Regular checkup",
            "summary": "Routine examination completed",
            "diagnosis": "Healthy",
            "treatment_plan": "Continue current lifestyle",
            "follow_up_required": False,
            "notes": "Patient in good health"
        }
        
        response = self.make_request("POST", "/visits/", visit_data)
        
        if response["success"]:
            created_visit = response["data"]
            visit_id = created_visit.get("visit", {}).get("id")
            self.created_resources["visits"].append(visit_id)
            self.log_test("Create Healthcare Visit", True, f"Visit created with ID: {visit_id}")
        else:
            self.log_test("Create Healthcare Visit", False, "Failed to create visit", response["data"])
            return
        
        # Test get visits
        response = self.make_request("GET", "/visits/")
        
        if response["success"]:
            visits_data = response["data"]
            visits = visits_data.get("visits", [])
            self.log_test("Get Healthcare Visits", True, f"Retrieved {len(visits)} visits")
        else:
            self.log_test("Get Healthcare Visits", False, "Failed to get visits", response["data"])
        
        # Test visit statistics
        response = self.make_request("GET", "/visits/stats/summary")
        
        if response["success"]:
            self.log_test("Get Visit Statistics", True, "Visit statistics retrieved")
        else:
            self.log_test("Get Visit Statistics", False, "Failed to get statistics", response["data"])
    
    def test_photo_upload_operations(self):
        """Test 7: Photo Upload Operations"""
        print("🔍 Testing Photo Upload Operations...")
        
        # Create a simple test image file
        test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
        
        # Test photo upload
        files = {'file': ('test.png', test_image_data, 'image/png')}
        data = {'description': 'Test photo upload via API'}
        
        response = self.make_request("POST", "/uploads/photos", data=data, files=files)
        
        if response["success"]:
            created_photo = response["data"]
            photo_id = created_photo.get("id")
            self.created_resources["photos"].append(photo_id)
            self.log_test("Upload Photo", True, f"Photo uploaded with ID: {photo_id}")
        else:
            self.log_test("Upload Photo", False, "Failed to upload photo", response["data"])
            return
        
        # Test get user photos
        response = self.make_request("GET", "/uploads/photos")
        
        if response["success"]:
            photos_data = response["data"]
            photos = photos_data.get("photos", [])
            self.log_test("Get User Photos", True, f"Retrieved {len(photos)} photos")
        else:
            self.log_test("Get User Photos", False, "Failed to get photos", response["data"])
    
    def test_family_sharing_operations(self):
        """Test 8: Family Sharing Operations"""
        print("🔍 Testing Family Sharing Operations...")
        
        # Test get family members (should be empty initially)
        response = self.make_request("GET", "/family/members")
        
        if response["success"]:
            members_data = response["data"]
            members = members_data.get("family_members", [])
            self.log_test("Get Family Members", True, f"Retrieved {len(members)} family members")
        else:
            self.log_test("Get Family Members", False, "Failed to get family members", response["data"])
        
        # Test sharing settings (fixed endpoint)
        sharing_settings = {
            "symptoms_sharing": True,
            "medications_sharing": True,
            "appointments_sharing": False,
            "photos_sharing": False
        }
        
        response = self.make_request("PUT", "/family/settings", sharing_settings)
        
        if response["success"]:
            self.log_test("Update Sharing Settings", True, "Sharing settings updated")
        else:
            self.log_test("Update Sharing Settings", False, "Failed to update sharing settings", response["data"])
    
    def test_data_persistence(self):
        """Test 9: Data Persistence and Retrieval"""
        print("🔍 Testing Data Persistence...")
        
        # Wait a moment to ensure data is persisted
        time.sleep(1)
        
        # Test that created data persists across requests
        total_items = 0
        
        # Check symptoms persistence
        response = self.make_request("GET", "/symptoms/")
        if response["success"]:
            symptoms = response["data"]
            total_items += len(symptoms)
            self.log_test("Symptoms Data Persistence", True, f"Found {len(symptoms)} persisted symptoms")
        else:
            self.log_test("Symptoms Data Persistence", False, "Failed to retrieve persisted symptoms")
        
        # Check medications persistence
        response = self.make_request("GET", "/medications/")
        if response["success"]:
            medications = response["data"]
            total_items += len(medications)
            self.log_test("Medications Data Persistence", True, f"Found {len(medications)} persisted medications")
        else:
            self.log_test("Medications Data Persistence", False, "Failed to retrieve persisted medications")
        
        # Check visits persistence
        response = self.make_request("GET", "/visits/")
        if response["success"]:
            visits_data = response["data"]
            visits = visits_data.get("visits", [])
            total_items += len(visits)
            self.log_test("Visits Data Persistence", True, f"Found {len(visits)} persisted visits")
        else:
            self.log_test("Visits Data Persistence", False, "Failed to retrieve persisted visits")
        
        # Check photos persistence
        response = self.make_request("GET", "/uploads/photos")
        if response["success"]:
            photos_data = response["data"]
            photos = photos_data.get("photos", [])
            total_items += len(photos)
            self.log_test("Photos Data Persistence", True, f"Found {len(photos)} persisted photos")
        else:
            self.log_test("Photos Data Persistence", False, "Failed to retrieve persisted photos")
        
        self.log_test("Overall Data Persistence", total_items > 0, f"Total persisted items: {total_items}")
    
    def test_error_handling(self):
        """Test 10: Error Handling and Edge Cases"""
        print("🔍 Testing Error Handling...")
        
        # Test invalid symptom ID
        response = self.make_request("GET", "/symptoms/invalid_id")
        if response["status_code"] == 400:
            self.log_test("Invalid Symptom ID Handling", True, "Properly handled invalid ID")
        else:
            self.log_test("Invalid Symptom ID Handling", False, "Did not handle invalid ID properly")
        
        # Test unauthorized access (without token)
        old_token = self.access_token
        self.access_token = None
        response = self.make_request("GET", "/symptoms/")
        # Check for 401 (Unauthorized) or 403 (Forbidden)
        if response["status_code"] in [401, 403]:
            self.log_test("Unauthorized Access Handling", True, "Properly rejected unauthorized request")
        else:
            self.log_test("Unauthorized Access Handling", False, f"Did not handle unauthorized access properly (got {response['status_code']})")
        self.access_token = old_token
        
        # Test invalid medication data
        invalid_medication = {
            "name": "",  # Invalid empty name
            "dosage": "10mg",
            "frequency": "daily"
        }
        response = self.make_request("POST", "/medications/", invalid_medication)
        if not response["success"]:
            self.log_test("Invalid Medication Data Handling", True, "Properly rejected invalid medication data")
        else:
            self.log_test("Invalid Medication Data Handling", False, "Did not validate medication data properly")
    
    def cleanup_test_data(self):
        """Clean up test data"""
        print("🧹 Cleaning up test data...")
        
        # Delete created symptoms
        for symptom_id in self.created_resources["symptoms"]:
            response = self.make_request("DELETE", f"/symptoms/{symptom_id}")
            if response["success"]:
                print(f"   Deleted symptom: {symptom_id}")
        
        # Delete created medications
        for medication_id in self.created_resources["medications"]:
            response = self.make_request("DELETE", f"/medications/{medication_id}")
            if response["success"]:
                print(f"   Deleted medication: {medication_id}")
        
        # Delete created visits
        for visit_id in self.created_resources["visits"]:
            response = self.make_request("DELETE", f"/visits/{visit_id}")
            if response["success"]:
                print(f"   Deleted visit: {visit_id}")
        
        # Delete created photos
        for photo_id in self.created_resources["photos"]:
            response = self.make_request("DELETE", f"/uploads/photos/{photo_id}")
            if response["success"]:
                print(f"   Deleted photo: {photo_id}")
    
    def generate_report(self):
        """Generate comprehensive test report"""
        print("\n" + "="*80)
        print("📊 MONGODB INTEGRATION TEST REPORT")
        print("="*80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        print()
        
        # Group results by category
        categories = {}
        for result in self.test_results:
            category = result["test_name"].split(" ")[0]
            if category not in categories:
                categories[category] = {"passed": 0, "failed": 0, "tests": []}
            
            if result["success"]:
                categories[category]["passed"] += 1
            else:
                categories[category]["failed"] += 1
            categories[category]["tests"].append(result)
        
        # Print category summaries
        for category, data in categories.items():
            total = data["passed"] + data["failed"]
            success_rate = (data["passed"] / total) * 100 if total > 0 else 0
            print(f"{category}: {data['passed']}/{total} ({success_rate:.1f}%)")
        
        print("\n" + "-"*80)
        print("DETAILED RESULTS:")
        print("-"*80)
        
        for result in self.test_results:
            status = "✅ PASS" if result["success"] else "❌ FAIL"
            print(f"{status}: {result['test_name']}")
            if result["details"]:
                print(f"   {result['details']}")
            if not result["success"] and result["data"]:
                print(f"   Error: {result['data']}")
        
        print("\n" + "="*80)
        print("MONGODB INTEGRATION ASSESSMENT:")
        print("="*80)
        
        if passed_tests == total_tests:
            print("🎉 EXCELLENT: All MongoDB operations are working perfectly!")
            print("   ✅ Database connection is stable")
            print("   ✅ All CRUD operations are functional")
            print("   ✅ Data persistence is working correctly")
            print("   ✅ Error handling is proper")
            print("   ✅ Authentication is secure")
            print("   ✅ Photo uploads are working")
            print("   ✅ Family sharing is functional")
        elif passed_tests >= total_tests * 0.9:
            print("🌟 EXCELLENT: MongoDB integration is working very well!")
            print("   ✅ Database connection is stable")
            print("   ✅ All major CRUD operations are functional")
            print("   ✅ Data persistence is working correctly")
            print("   ✅ Most features are working properly")
            print("   ⚠️  Minor issues detected that should be addressed")
        elif passed_tests >= total_tests * 0.8:
            print("✅ GOOD: MongoDB integration is mostly working well")
            print("   Some minor issues detected that should be addressed")
        elif passed_tests >= total_tests * 0.6:
            print("⚠️  FAIR: MongoDB integration has some significant issues")
            print("   Several operations are failing and need attention")
        else:
            print("❌ POOR: MongoDB integration has major problems")
            print("   Critical issues detected that need immediate attention")
        
        # Save detailed report to file
        report_data = {
            "summary": {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": failed_tests,
                "success_rate": (passed_tests/total_tests)*100,
                "test_timestamp": datetime.now().isoformat()
            },
            "categories": categories,
            "detailed_results": self.test_results
        }
        
        with open("mongodb_integration_test_report_final.json", "w") as f:
            json.dump(report_data, f, indent=2, default=str)
        
        print(f"\n📄 Detailed report saved to: mongodb_integration_test_report_final.json")
        print("="*80)
    
    async def run_all_tests(self):
        """Run all MongoDB integration tests"""
        print("🚀 Starting Comprehensive MongoDB Integration Tests...")
        print("="*80)
        
        # Run tests in sequence
        self.test_database_health()
        
        if self.test_user_authentication():
            self.test_user_profile_operations()
            self.test_symptom_operations()
            self.test_medication_operations()
            self.test_healthcare_visit_operations()
            self.test_photo_upload_operations()
            self.test_family_sharing_operations()
            self.test_data_persistence()
            self.test_error_handling()
            
            # Cleanup
            self.cleanup_test_data()
        else:
            print("❌ Authentication failed - skipping remaining tests")
        
        # Generate final report
        self.generate_report()

def main():
    """Main test execution"""
    tester = MongoDBIntegrationTester()
    asyncio.run(tester.run_all_tests())

if __name__ == "__main__":
    main()