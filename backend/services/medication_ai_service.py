"""
Medication AI Service

Provides intelligent medication assistance including:
- Medication name suggestions
- Real-time safety information generation
- Medication purpose analysis

This service leverages medical knowledge while being clear that it's for
informational purposes and not a substitute for professional medical advice.
"""

import os
import json
import httpx
import logging
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MedicationSuggestion(BaseModel):
    """Model for medication suggestion response"""
    name: str = Field(..., description="Medication name")
    generic_name: str = Field(..., description="Generic name if different from brand name")
    purpose: str = Field(..., description="Primary purpose/indication")
    reasoning: str = Field(..., description="Why this medication is suggested")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence in suggestion (0-1)")

class SafetyInformation(BaseModel):
    """Model for medication safety information"""
    medication_name: str = Field(..., description="Name of the medication")
    emergency_warnings: List[str] = Field(default_factory=list, description="Emergency warning signs")
    common_side_effects: List[str] = Field(default_factory=list, description="Common side effects")
    serious_side_effects: List[str] = Field(default_factory=list, description="Serious side effects")
    drug_interactions: List[str] = Field(default_factory=list, description="Notable drug interactions")
    contraindications: List[str] = Field(default_factory=list, description="Contraindications")
    special_precautions: List[str] = Field(default_factory=list, description="Special precautions")
    dosage_considerations: List[str] = Field(default_factory=list, description="Dosage-specific considerations")

class MedicationPurpose(BaseModel):
    """Model for medication purpose analysis"""
    medication_name: str = Field(..., description="Name of the medication")
    primary_purpose: str = Field(..., description="Primary therapeutic purpose")
    secondary_purposes: List[str] = Field(default_factory=list, description="Secondary/off-label uses")
    mechanism_of_action: str = Field(..., description="How the medication works")
    therapeutic_class: str = Field(..., description="Therapeutic classification")

class MedicationAIService:
    """
    Specialized AI service for medication-related queries and assistance.
    
    Provides intelligent medication suggestions, safety information, and purpose analysis
    while maintaining clear disclaimers about professional medical advice.
    """
    
    def __init__(self):
        """Initialize the Medication AI Service"""
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
            
        self.base_url = "https://api.openai.com/v1"
        self.model = "gpt-3.5-turbo"  # Use gpt-3.5-turbo for compatibility
        
        # Medical disclaimer
        self.medical_disclaimer = (
            "IMPORTANT MEDICAL DISCLAIMER: This information is for educational purposes only "
            "and is not a substitute for professional medical advice, diagnosis, or treatment. "
            "Always consult with a qualified healthcare provider before making any decisions "
            "about medications or medical treatments."
        )
        
        logger.info("Medication AI Service initialized")
    
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
                timeout=60.0
            )
            response.raise_for_status()
            return response.json()
    
    async def suggest_medications(
        self,
        partial_name: str,
        purpose: str = None,
        patient_context: str = None
    ) -> Dict[str, Any]:
        """
        Suggest medications based on partial input and optional context.
        
        Args:
            partial_name: Partial medication name or description
            purpose: Optional purpose/condition for the medication
            patient_context: Optional patient context (age, conditions, etc.)
            
        Returns:
            Dict containing medication suggestions and metadata
        """
        try:
            # Construct the prompt
            prompt = self._build_medication_suggestion_prompt(partial_name, purpose, patient_context)
            
            data = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a knowledgeable medical AI assistant specializing in medication information. "
                                 "Provide accurate, evidence-based medication suggestions while emphasizing the need "
                                 "for professional medical consultation. Always include confidence scores and reasoning. "
                                 "Focus on commonly prescribed, FDA-approved medications."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.3,
                "max_tokens": 1500
            }
            
            response = await self._make_request("chat/completions", data)
            
            # Parse the response
            content = response["choices"][0]["message"]["content"]
            suggestions_data = self._parse_medication_suggestions(content)
            
            return {
                "success": True,
                "suggestions": suggestions_data,
                "disclaimer": self.medical_disclaimer,
                "query_info": {
                    "partial_name": partial_name,
                    "purpose": purpose,
                    "patient_context": patient_context
                }
            }
            
        except Exception as e:
            logger.error(f"Error in suggest_medications: {str(e)}")
            return {
                "success": False,
                "error": f"Failed to generate medication suggestions: {str(e)}",
                "suggestions": [],
                "disclaimer": self.medical_disclaimer
            }
    
    async def generate_safety_information(
        self,
        medication_name: str,
        dosage: str = None
    ) -> Dict[str, Any]:
        """
        Generate comprehensive safety information for a specific medication.
        
        Args:
            medication_name: Name of the medication
            dosage: Optional dosage information
            
        Returns:
            Dict containing comprehensive safety information
        """
        try:
            # Construct the prompt
            prompt = self._build_safety_information_prompt(medication_name, dosage)
            
            data = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a medical safety expert AI. Provide comprehensive, accurate safety "
                                 "information for medications including emergency warnings, side effects, interactions, "
                                 "and precautions. Be thorough but clear, and always emphasize professional medical guidance. "
                                 "Base information on FDA-approved labeling and clinical guidelines."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.2,
                "max_tokens": 2000
            }
            
            response = await self._make_request("chat/completions", data)
            
            # Parse the response
            content = response["choices"][0]["message"]["content"]
            safety_data = self._parse_safety_information(content, medication_name)
            
            return {
                "success": True,
                "safety_information": safety_data,
                "disclaimer": self.medical_disclaimer,
                "medication_name": medication_name,
                "dosage": dosage
            }
            
        except Exception as e:
            logger.error(f"Error in generate_safety_information: {str(e)}")
            return {
                "success": False,
                "error": f"Failed to generate safety information: {str(e)}",
                "safety_information": None,
                "disclaimer": self.medical_disclaimer
            }
    
    async def analyze_medication_purpose(self, medication_name: str) -> Dict[str, Any]:
        """
        Analyze and explain the purpose and mechanism of action for a medication.
        
        Args:
            medication_name: Name of the medication to analyze
            
        Returns:
            Dict containing medication purpose analysis
        """
        try:
            # Construct the prompt
            prompt = self._build_purpose_analysis_prompt(medication_name)
            
            data = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a clinical pharmacology expert AI. Provide detailed analysis of "
                                 "medication purposes, mechanisms of action, and therapeutic classifications. "
                                 "Be educational and thorough while maintaining accuracy. Focus on FDA-approved "
                                 "indications and well-established clinical uses."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.2,
                "max_tokens": 1200
            }
            
            response = await self._make_request("chat/completions", data)
            
            # Parse the response
            content = response["choices"][0]["message"]["content"]
            purpose_data = self._parse_purpose_analysis(content, medication_name)
            
            return {
                "success": True,
                "purpose_analysis": purpose_data,
                "disclaimer": self.medical_disclaimer,
                "medication_name": medication_name
            }
            
        except Exception as e:
            logger.error(f"Error in analyze_medication_purpose: {str(e)}")
            return {
                "success": False,
                "error": f"Failed to analyze medication purpose: {str(e)}",
                "purpose_analysis": None,
                "disclaimer": self.medical_disclaimer
            }
    
    def _build_medication_suggestion_prompt(
        self, 
        partial_name: str, 
        purpose: str = None, 
        patient_context: str = None
    ) -> str:
        """Build prompt for medication suggestions"""
        prompt = f"""
        Based on the partial medication name or description: "{partial_name}"
        """
        
        if purpose:
            prompt += f"\nIntended purpose/condition: {purpose}"
        
        if patient_context:
            prompt += f"\nPatient context: {patient_context}"
        
        prompt += """
        
        Please provide up to 5 medication suggestions in the following JSON format:
        {
            "suggestions": [
                {
                    "name": "Medication Name",
                    "generic_name": "Generic Name",
                    "purpose": "Primary purpose/indication",
                    "reasoning": "Why this medication matches the query",
                    "confidence_score": 0.95
                }
            ]
        }
        
        Consider:
        - Exact name matches first
        - Similar sounding medications
        - Medications for the specified purpose
        - Common alternatives and generics
        - Include confidence scores (0.0-1.0)
        - Provide clear reasoning for each suggestion
        - Focus on commonly prescribed, FDA-approved medications
        """
        
        return prompt
    
    def _build_safety_information_prompt(self, medication_name: str, dosage: str = None) -> str:
        """Build prompt for safety information"""
        prompt = f"""
        Provide comprehensive safety information for: {medication_name}
        """
        
        if dosage:
            prompt += f"\nSpecific dosage: {dosage}"
        
        prompt += """
        
        Please provide detailed safety information in the following JSON format:
        {
            "emergency_warnings": ["List of emergency warning signs that require immediate medical attention"],
            "common_side_effects": ["List of common side effects (>1% incidence)"],
            "serious_side_effects": ["List of serious side effects that require medical attention"],
            "drug_interactions": ["Notable drug interactions to be aware of"],
            "contraindications": ["Conditions or situations where this medication should not be used"],
            "special_precautions": ["Special precautions and monitoring requirements"],
            "dosage_considerations": ["Dosage-specific considerations if applicable"]
        }
        
        Be comprehensive and include:
        - Emergency signs requiring immediate medical attention
        - Both common and serious side effects based on clinical data
        - Important drug interactions (major interactions)
        - Absolute and relative contraindications
        - Special populations considerations (elderly, pregnancy, renal/hepatic impairment)
        - Monitoring requirements and precautions
        - Black box warnings if applicable
        """
        
        return prompt
    
    def _build_purpose_analysis_prompt(self, medication_name: str) -> str:
        """Build prompt for purpose analysis"""
        return f"""
        Analyze the therapeutic purpose and mechanism of action for: {medication_name}
        
        Please provide detailed analysis in the following JSON format:
        {{
            "primary_purpose": "Main FDA-approved therapeutic indication",
            "secondary_purposes": ["List of secondary or off-label uses"],
            "mechanism_of_action": "How the medication works in the body",
            "therapeutic_class": "Therapeutic classification"
        }}
        
        Include:
        - Primary FDA-approved indication
        - Common off-label uses (evidence-based)
        - Detailed mechanism of action at molecular/cellular level
        - Therapeutic class/category (e.g., ACE inhibitor, SSRI, etc.)
        - How it achieves its therapeutic effect
        - Onset of action and duration if relevant
        """
    
    def _parse_medication_suggestions(self, content: str) -> List[Dict[str, Any]]:
        """Parse medication suggestions from AI response"""
        try:
            # Try to extract JSON from the response
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = content[start_idx:end_idx]
                data = json.loads(json_str)
                return data.get('suggestions', [])
            else:
                # Fallback: parse manually if JSON extraction fails
                return self._manual_parse_suggestions(content)
                
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON response, attempting manual parsing")
            return self._manual_parse_suggestions(content)
    
    def _parse_safety_information(self, content: str, medication_name: str) -> Dict[str, Any]:
        """Parse safety information from AI response"""
        try:
            # Try to extract JSON from the response
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = content[start_idx:end_idx]
                data = json.loads(json_str)
                data['medication_name'] = medication_name
                return data
            else:
                # Fallback: create structured response
                return self._manual_parse_safety(content, medication_name)
                
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON response, attempting manual parsing")
            return self._manual_parse_safety(content, medication_name)
    
    def _parse_purpose_analysis(self, content: str, medication_name: str) -> Dict[str, Any]:
        """Parse purpose analysis from AI response"""
        try:
            # Try to extract JSON from the response
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = content[start_idx:end_idx]
                data = json.loads(json_str)
                data['medication_name'] = medication_name
                return data
            else:
                # Fallback: create structured response
                return self._manual_parse_purpose(content, medication_name)
                
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON response, attempting manual parsing")
            return self._manual_parse_purpose(content, medication_name)
    
    def _manual_parse_suggestions(self, content: str) -> List[Dict[str, Any]]:
        """Manual parsing fallback for medication suggestions"""
        # This is a simplified fallback - in production, you might want more sophisticated parsing
        return [{
            "name": "Unable to parse suggestions",
            "generic_name": "N/A",
            "purpose": "Parsing error occurred",
            "reasoning": "The AI response could not be parsed properly. Please try again.",
            "confidence_score": 0.0
        }]
    
    def _manual_parse_safety(self, content: str, medication_name: str) -> Dict[str, Any]:
        """Manual parsing fallback for safety information"""
        return {
            "medication_name": medication_name,
            "emergency_warnings": ["Unable to parse safety information"],
            "common_side_effects": ["Parsing error occurred"],
            "serious_side_effects": ["Please consult healthcare provider"],
            "drug_interactions": ["Unable to determine interactions"],
            "contraindications": ["Consult prescribing information"],
            "special_precautions": ["Seek professional medical advice"],
            "dosage_considerations": ["Follow healthcare provider instructions"]
        }
    
    def _manual_parse_purpose(self, content: str, medication_name: str) -> Dict[str, Any]:
        """Manual parsing fallback for purpose analysis"""
        return {
            "medication_name": medication_name,
            "primary_purpose": "Unable to parse purpose information",
            "secondary_purposes": ["Parsing error occurred"],
            "mechanism_of_action": "Please consult prescribing information",
            "therapeutic_class": "Unable to determine"
        }

# Global instance - initialize lazily to avoid startup errors
medication_ai_service = None

def get_medication_ai_service():
    """Get or create the Medication AI service instance"""
    global medication_ai_service
    if medication_ai_service is None:
        medication_ai_service = MedicationAIService()
    return medication_ai_service