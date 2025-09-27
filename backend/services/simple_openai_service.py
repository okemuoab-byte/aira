import os
import json
import httpx
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class SimpleOpenAIService:
    def __init__(self):
        """Initialize OpenAI service with API key from environment variables."""
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        
        self.base_url = "https://api.openai.com/v1"
        self.default_model = "gpt-3.5-turbo"
    
    async def _make_request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make a request to the OpenAI API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/{endpoint}",
                headers=headers,
                json=data,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    async def generate_health_insights(self, symptoms: List[str], medical_history: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate health insights based on symptoms and medical history.
        
        Args:
            symptoms: List of symptoms reported by the user
            medical_history: Optional medical history context
            
        Returns:
            Dictionary containing AI-generated health insights
        """
        try:
            # Construct the prompt
            prompt = self._build_health_insights_prompt(symptoms, medical_history)
            
            data = {
                "model": self.default_model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a helpful medical assistant. Provide general health information and insights based on symptoms. Always recommend consulting with healthcare professionals for proper diagnosis and treatment. Do not provide specific medical diagnoses."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 500,
                "temperature": 0.7
            }
            
            response = await self._make_request("chat/completions", data)
            
            return {
                "insights": response["choices"][0]["message"]["content"],
                "model_used": self.default_model,
                "disclaimer": "This information is for educational purposes only. Please consult with a healthcare professional for proper medical advice."
            }
            
        except Exception as e:
            return {
                "error": f"Failed to generate health insights: {str(e)}",
                "insights": None
            }
    
    async def analyze_symptom_progression(self, symptom_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze symptom progression over time.
        
        Args:
            symptom_history: List of symptom entries with timestamps and details
            
        Returns:
            Dictionary containing progression analysis
        """
        try:
            prompt = self._build_progression_analysis_prompt(symptom_history)
            
            data = {
                "model": self.default_model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a medical data analyst. Analyze symptom patterns and progression over time. Provide insights about trends, potential triggers, and recommendations for tracking. Always emphasize the importance of professional medical consultation."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 400,
                "temperature": 0.6
            }
            
            response = await self._make_request("chat/completions", data)
            
            return {
                "analysis": response["choices"][0]["message"]["content"],
                "model_used": self.default_model,
                "disclaimer": "This analysis is for informational purposes only. Consult healthcare professionals for medical advice."
            }
            
        except Exception as e:
            return {
                "error": f"Failed to analyze symptom progression: {str(e)}",
                "analysis": None
            }
    
    async def generate_medication_reminders(self, medications: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate personalized medication reminders and tips.
        
        Args:
            medications: List of medication information
            
        Returns:
            Dictionary containing reminder suggestions
        """
        try:
            prompt = self._build_medication_reminder_prompt(medications)
            
            data = {
                "model": self.default_model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a medication adherence assistant. Provide helpful reminders and tips for taking medications safely and effectively. Always emphasize following healthcare provider instructions."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 300,
                "temperature": 0.5
            }
            
            response = await self._make_request("chat/completions", data)
            
            return {
                "reminders": response["choices"][0]["message"]["content"],
                "model_used": self.default_model,
                "disclaimer": "Always follow your healthcare provider's instructions for medication use."
            }
            
        except Exception as e:
            return {
                "error": f"Failed to generate medication reminders: {str(e)}",
                "reminders": None
            }
    
    def _build_health_insights_prompt(self, symptoms: List[str], medical_history: Optional[str]) -> str:
        """Build prompt for health insights generation."""
        prompt = f"Based on the following symptoms: {', '.join(symptoms)}"
        
        if medical_history:
            prompt += f"\n\nMedical history context: {medical_history}"
        
        prompt += "\n\nPlease provide general health insights, possible causes to consider, and recommendations for next steps. Remember to emphasize the importance of consulting healthcare professionals."
        
        return prompt
    
    def _build_progression_analysis_prompt(self, symptom_history: List[Dict[str, Any]]) -> str:
        """Build prompt for symptom progression analysis."""
        prompt = "Analyze the following symptom progression over time:\n\n"
        
        for entry in symptom_history:
            date = entry.get('date', 'Unknown date')
            symptoms = entry.get('symptoms', [])
            severity = entry.get('severity', 'Unknown')
            prompt += f"Date: {date}, Symptoms: {', '.join(symptoms)}, Severity: {severity}\n"
        
        prompt += "\nPlease analyze patterns, trends, and provide insights about the progression."
        
        return prompt
    
    def _build_medication_reminder_prompt(self, medications: List[Dict[str, Any]]) -> str:
        """Build prompt for medication reminder generation."""
        prompt = "Generate helpful reminders and tips for the following medications:\n\n"
        
        for med in medications:
            name = med.get('name', 'Unknown medication')
            dosage = med.get('dosage', 'Unknown dosage')
            frequency = med.get('frequency', 'Unknown frequency')
            prompt += f"Medication: {name}, Dosage: {dosage}, Frequency: {frequency}\n"
        
        prompt += "\nProvide personalized reminders and adherence tips."
        
        return prompt

# Global instance - initialize lazily to avoid startup errors
simple_openai_service = None

def get_simple_openai_service():
    """Get or create the simple OpenAI service instance"""
    global simple_openai_service
    if simple_openai_service is None:
        simple_openai_service = SimpleOpenAIService()
    return simple_openai_service