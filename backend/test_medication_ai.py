#!/usr/bin/env python3
"""
Test script for the Medication AI Service

This script tests the three main methods of the MedicationAIService:
1. suggest_medications
2. generate_safety_information  
3. analyze_medication_purpose
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.medication_ai_service import get_medication_ai_service

async def test_medication_suggestions():
    """Test medication suggestions functionality"""
    print("=" * 60)
    print("TESTING MEDICATION SUGGESTIONS")
    print("=" * 60)
    
    service = get_medication_ai_service()
    
    # Test 1: Partial name match
    print("\n1. Testing partial name match: 'aspir'")
    result = await service.suggest_medications("aspir")
    print(f"Success: {result['success']}")
    if result['success']:
        print(f"Number of suggestions: {len(result['suggestions'])}")
        for i, suggestion in enumerate(result['suggestions'][:2], 1):  # Show first 2
            print(f"  {i}. {suggestion.get('name', 'N/A')} - {suggestion.get('purpose', 'N/A')}")
    else:
        print(f"Error: {result.get('error', 'Unknown error')}")
    
    # Test 2: With purpose
    print("\n2. Testing with purpose: 'ibu' for pain relief")
    result = await service.suggest_medications("ibu", purpose="pain relief")
    print(f"Success: {result['success']}")
    if result['success']:
        print(f"Number of suggestions: {len(result['suggestions'])}")
        for i, suggestion in enumerate(result['suggestions'][:2], 1):  # Show first 2
            print(f"  {i}. {suggestion.get('name', 'N/A')} - Confidence: {suggestion.get('confidence_score', 0)}")
    else:
        print(f"Error: {result.get('error', 'Unknown error')}")

async def test_safety_information():
    """Test safety information generation"""
    print("\n" + "=" * 60)
    print("TESTING SAFETY INFORMATION")
    print("=" * 60)
    
    service = get_medication_ai_service()
    
    # Test with a common medication
    print("\n1. Testing safety information for: Ibuprofen")
    result = await service.generate_safety_information("Ibuprofen")
    print(f"Success: {result['success']}")
    if result['success']:
        safety_info = result['safety_information']
        print(f"Emergency warnings: {len(safety_info.get('emergency_warnings', []))}")
        print(f"Common side effects: {len(safety_info.get('common_side_effects', []))}")
        print(f"Drug interactions: {len(safety_info.get('drug_interactions', []))}")
        
        # Show first emergency warning if available
        if safety_info.get('emergency_warnings'):
            print(f"First emergency warning: {safety_info['emergency_warnings'][0]}")
    else:
        print(f"Error: {result.get('error', 'Unknown error')}")

async def test_medication_purpose():
    """Test medication purpose analysis"""
    print("\n" + "=" * 60)
    print("TESTING MEDICATION PURPOSE ANALYSIS")
    print("=" * 60)
    
    service = get_medication_ai_service()
    
    # Test with a common medication
    print("\n1. Testing purpose analysis for: Metformin")
    result = await service.analyze_medication_purpose("Metformin")
    print(f"Success: {result['success']}")
    if result['success']:
        purpose_info = result['purpose_analysis']
        print(f"Primary purpose: {purpose_info.get('primary_purpose', 'N/A')}")
        print(f"Therapeutic class: {purpose_info.get('therapeutic_class', 'N/A')}")
        print(f"Secondary purposes: {len(purpose_info.get('secondary_purposes', []))}")
        
        # Show mechanism of action preview
        mechanism = purpose_info.get('mechanism_of_action', '')
        if mechanism:
            print(f"Mechanism preview: {mechanism[:100]}...")
    else:
        print(f"Error: {result.get('error', 'Unknown error')}")

async def main():
    """Run all tests"""
    print("MEDICATION AI SERVICE TEST SUITE")
    print("Testing the three main methods of the service...")
    
    try:
        # Test each method
        await test_medication_suggestions()
        await test_safety_information()
        await test_medication_purpose()
        
        print("\n" + "=" * 60)
        print("TEST SUITE COMPLETED")
        print("=" * 60)
        print("All tests have been executed. Check the output above for results.")
        
    except Exception as e:
        print(f"\nFATAL ERROR: {str(e)}")
        print("Make sure your OPENAI_API_KEY is set in the .env file")
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)