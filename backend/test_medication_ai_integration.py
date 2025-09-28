#!/usr/bin/env python3
"""
Test script to verify the medication AI integration is working properly.
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.medication_ai_service import get_medication_ai_service

async def test_medication_ai_integration():
    """Test the medication AI service integration"""
    print("Testing Medication AI Service Integration...")
    print("=" * 50)
    
    try:
        # Get the AI service instance
        ai_service = get_medication_ai_service()
        print("✅ AI Service initialized successfully")
        
        # Test 1: Medication suggestions
        print("\n🔍 Testing medication suggestions...")
        suggestions_response = await ai_service.suggest_medications(
            partial_name="aspir",
            purpose="pain relief"
        )
        
        if suggestions_response["success"]:
            print("✅ Medication suggestions working")
            print(f"   Found {len(suggestions_response['suggestions'])} suggestions")
            if suggestions_response['suggestions']:
                first_suggestion = suggestions_response['suggestions'][0]
                print(f"   First suggestion: {first_suggestion.get('name', 'N/A')}")
        else:
            print("❌ Medication suggestions failed")
            print(f"   Error: {suggestions_response.get('error', 'Unknown error')}")
        
        # Test 2: Safety information
        print("\n🛡️ Testing safety information generation...")
        safety_response = await ai_service.generate_safety_information(
            medication_name="aspirin",
            dosage="325mg"
        )
        
        if safety_response["success"]:
            print("✅ Safety information generation working")
            safety_info = safety_response["safety_information"]
            print(f"   Emergency warnings: {len(safety_info.get('emergency_warnings', []))}")
            print(f"   Common side effects: {len(safety_info.get('common_side_effects', []))}")
        else:
            print("❌ Safety information generation failed")
            print(f"   Error: {safety_response.get('error', 'Unknown error')}")
        
        # Test 3: Purpose analysis
        print("\n🎯 Testing medication purpose analysis...")
        purpose_response = await ai_service.analyze_medication_purpose("aspirin")
        
        if purpose_response["success"]:
            print("✅ Purpose analysis working")
            purpose_data = purpose_response["purpose_analysis"]
            print(f"   Primary purpose: {purpose_data.get('primary_purpose', 'N/A')}")
            print(f"   Therapeutic class: {purpose_data.get('therapeutic_class', 'N/A')}")
        else:
            print("❌ Purpose analysis failed")
            print(f"   Error: {purpose_response.get('error', 'Unknown error')}")
        
        print("\n" + "=" * 50)
        print("✅ Medication AI Integration Test Complete!")
        
    except Exception as e:
        print(f"❌ Integration test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_medication_ai_integration())