#!/usr/bin/env python3
"""
Direct test of the clinical AI service to identify the 500 error
"""
import asyncio
import sys
import os
from datetime import datetime

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.enhanced_clinical_ai_service import get_enhanced_clinical_ai_service

async def test_clinical_ai_service_directly():
    """Test the clinical AI service directly without going through the API"""
    
    print("Testing Enhanced Clinical AI Service directly...")
    print("=" * 60)
    
    # Sample test data
    symptoms = [
        {
            "body_part": "head",
            "type": "headache",
            "intensity": 7,
            "duration": "2 hours",
            "onset": "sudden",
            "notes": "Sharp pain on left side",
            "timestamp": datetime.utcnow().isoformat()
        }
    ]
    
    patient_profile = {
        "age": 35,
        "gender": "female",
        "weight": "65kg",
        "height": "165cm"
    }
    
    medical_history = ["migraine", "hypertension"]
    current_medications = ["ibuprofen", "lisinopril"]
    
    try:
        # Initialize the service
        print("1. Initializing Enhanced Clinical AI Service...")
        ai_service = get_enhanced_clinical_ai_service()
        print("✓ Service initialized successfully")
        
        # Test comprehensive assessment
        print("\n2. Testing comprehensive clinical assessment...")
        print(f"   Symptoms: {len(symptoms)} symptom(s)")
        print(f"   Patient: {patient_profile['age']} year old {patient_profile['gender']}")
        print(f"   Medical History: {medical_history}")
        print(f"   Medications: {current_medications}")
        
        result = await ai_service.comprehensive_clinical_assessment(
            symptoms=symptoms,
            patient_profile=patient_profile,
            medical_history=medical_history,
            current_medications=current_medications
        )
        
        print(f"\n3. Assessment Result:")
        print(f"   Success: {result.get('success', False)}")
        
        if result.get('success'):
            assessment = result.get('assessment', {})
            print(f"   Assessment ID: {assessment.get('assessment_id', 'N/A')}")
            print(f"   Urgency Level: {assessment.get('urgency_level', 'N/A')}")
            print(f"   Risk Level: {assessment.get('risk_level', 'N/A')}")
            print(f"   Primary Concern: {assessment.get('primary_concern', 'N/A')}")
            print("✓ Assessment completed successfully!")
        else:
            print(f"✗ Assessment failed!")
            print(f"   Error: {result.get('error', 'Unknown error')}")
            if 'raw_response' in result:
                print(f"   Raw Response: {result['raw_response'][:200]}...")
        
        return result
        
    except Exception as e:
        print(f"\n✗ Exception occurred: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    result = asyncio.run(test_clinical_ai_service_directly())
    
    print("\n" + "=" * 60)
    if result.get('success'):
        print("🎉 TEST PASSED: Clinical AI service is working correctly!")
    else:
        print("❌ TEST FAILED: Clinical AI service has issues!")
        print(f"Error: {result.get('error', 'Unknown error')}")