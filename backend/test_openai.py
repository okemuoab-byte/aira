#!/usr/bin/env python3
"""
Simple test script to verify OpenAI integration
"""
import asyncio
import os
from services.openai_service import get_openai_service

async def test_openai_integration():
    """Test the OpenAI service integration"""
    try:
        print("Testing OpenAI integration...")
        
        # Get the service
        service = get_openai_service()
        print(f"✓ OpenAI service initialized successfully")
        print(f"✓ API Key configured: {'Yes' if service.api_key else 'No'}")
        print(f"✓ Default model: {service.default_model}")
        
        # Test health insights generation
        print("\nTesting health insights generation...")
        test_symptoms = ["headache", "fatigue", "nausea"]
        test_history = "No significant medical history"
        
        insights = await service.generate_health_insights(test_symptoms, test_history)
        
        if "error" in insights:
            print(f"✗ Error generating insights: {insights['error']}")
        else:
            print("✓ Health insights generated successfully")
            print(f"  Model used: {insights.get('model_used', 'Unknown')}")
            print(f"  Insights preview: {insights.get('insights', '')[:100]}...")
        
        print("\n" + "="*50)
        print("OpenAI integration test completed!")
        
    except Exception as e:
        print(f"✗ Error during testing: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    asyncio.run(test_openai_integration())