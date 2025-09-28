import os
import json
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class EnhancedClinicalAIService:
    def __init__(self):
        """Initialize Enhanced Clinical AI service with API key from environment variables."""
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        
        self.base_url = "https://api.openai.com/v1"
        self.default_model = "gpt-4"  # Using GPT-4 for better clinical reasoning
    
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
    
    async def comprehensive_clinical_assessment(
        self, 
        symptoms: List[Dict[str, Any]], 
        patient_profile: Dict[str, Any],
        medical_history: Optional[List[str]] = None,
        current_medications: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Generate comprehensive clinical assessment with results, summary, and next steps.
        
        Args:
            symptoms: List of symptom data with intensity, location, duration, etc.
            patient_profile: Patient demographics, age, gender, etc.
            medical_history: List of known medical conditions
            current_medications: List of current medications
            
        Returns:
            Dictionary containing comprehensive clinical assessment
        """
        try:
            prompt = self._build_comprehensive_assessment_prompt(
                symptoms, patient_profile, medical_history, current_medications
            )
            
            data = {
                "model": self.default_model,
                "messages": [
                    {
                        "role": "system",
                        "content": """You are an advanced clinical AI assistant trained on NICE guidelines, medical literature, and clinical decision support tools. 
                        
                        Your role is to provide comprehensive clinical assessments that include:
                        1. Detailed symptom analysis and clinical reasoning
                        2. Risk stratification and urgency assessment
                        3. Differential diagnosis considerations
                        4. Evidence-based recommendations
                        5. Clear next steps and action plans
                        6. Patient education and safety netting
                        
                        Always follow NICE guidelines and clinical best practices. Provide structured, actionable recommendations while emphasizing the importance of professional medical oversight.
                        
                        Return your response as a structured JSON object with the following format:
                        {
                            "assessment_id": "unique_id",
                            "timestamp": "ISO_timestamp",
                            "urgency_level": "emergency|urgent|routine|self-care",
                            "risk_level": "critical|high|moderate|low",
                            "classification": "acute|chronic|acute-on-chronic",
                            "severity_score": 1-10,
                            "primary_concern": "main clinical concern",
                            "clinical_summary": "comprehensive summary of findings",
                            "differential_diagnosis": ["list of possible diagnoses"],
                            "red_flags": ["list of concerning features"],
                            "clinical_reasoning": "detailed reasoning process",
                            "recommendations": {
                                "immediate_actions": ["urgent actions needed"],
                                "short_term_plan": ["actions for next 24-48 hours"],
                                "long_term_plan": ["ongoing management recommendations"],
                                "monitoring_plan": ["what to monitor and when"]
                            },
                            "next_steps": {
                                "healthcare_contact": "when and who to contact",
                                "timeframe": "specific timeframe for action",
                                "escalation_criteria": ["when to seek urgent care"],
                                "follow_up_required": true/false,
                                "follow_up_timeframe": "when to follow up"
                            },
                            "patient_education": {
                                "condition_explanation": "explanation of likely condition",
                                "self_care_advice": ["self-care recommendations"],
                                "warning_signs": ["signs that require immediate attention"],
                                "lifestyle_advice": ["relevant lifestyle modifications"]
                            },
                            "professional_review": {
                                "required": true/false,
                                "priority": "immediate|urgent|routine",
                                "specialty_referral": "specialty if needed",
                                "rationale": "reason for professional review"
                            },
                            "nice_guidelines": ["relevant NICE guidelines applied"],
                            "confidence_level": "high|moderate|low",
                            "limitations": ["assessment limitations and caveats"]
                        }"""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 2000,
                "temperature": 0.3  # Lower temperature for more consistent clinical reasoning
            }
            
            response = await self._make_request("chat/completions", data)
            
            # Parse the JSON response
            content = response["choices"][0]["message"]["content"]
            
            try:
                assessment_data = json.loads(content)
                
                # Add metadata
                assessment_data["model_used"] = self.default_model
                assessment_data["generated_at"] = datetime.utcnow().isoformat()
                assessment_data["disclaimer"] = "This AI assessment is for informational purposes only and does not replace professional medical judgment. Always seek immediate medical attention for emergencies."
                
                return {
                    "success": True,
                    "assessment": assessment_data
                }
                
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    "success": False,
                    "error": "Failed to parse AI response",
                    "raw_response": content
                }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to generate clinical assessment: {str(e)}"
            }
    
    async def generate_symptom_summary(
        self, 
        symptoms: List[Dict[str, Any]], 
        timeframe: str = "recent"
    ) -> Dict[str, Any]:
        """
        Generate AI-powered summary of symptoms over time.
        
        Args:
            symptoms: List of symptom entries
            timeframe: Time period to analyze (recent, weekly, monthly)
            
        Returns:
            Dictionary containing symptom summary and trends
        """
        try:
            prompt = self._build_symptom_summary_prompt(symptoms, timeframe)
            
            data = {
                "model": self.default_model,
                "messages": [
                    {
                        "role": "system",
                        "content": """You are a clinical data analyst specializing in symptom pattern recognition and trend analysis. 
                        
                        Analyze the provided symptom data and generate a comprehensive summary that includes:
                        1. Overall symptom patterns and trends
                        2. Severity changes over time
                        3. Potential triggers or correlations
                        4. Areas of concern or improvement
                        5. Recommendations for monitoring
                        
                        Return your response as a structured JSON object."""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 1000,
                "temperature": 0.4
            }
            
            response = await self._make_request("chat/completions", data)
            content = response["choices"][0]["message"]["content"]
            
            try:
                summary_data = json.loads(content)
                return {
                    "success": True,
                    "summary": summary_data,
                    "model_used": self.default_model
                }
            except json.JSONDecodeError:
                return {
                    "success": False,
                    "error": "Failed to parse summary response",
                    "raw_response": content
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to generate symptom summary: {str(e)}"
            }
    
    async def generate_personalized_action_plan(
        self, 
        assessment: Dict[str, Any],
        patient_preferences: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate personalized action plan based on clinical assessment.
        
        Args:
            assessment: Clinical assessment data
            patient_preferences: Patient preferences and constraints
            
        Returns:
            Dictionary containing personalized action plan
        """
        try:
            prompt = self._build_action_plan_prompt(assessment, patient_preferences)
            
            data = {
                "model": self.default_model,
                "messages": [
                    {
                        "role": "system",
                        "content": """You are a healthcare care coordinator specializing in creating personalized, actionable healthcare plans.
                        
                        Based on the clinical assessment and patient preferences, create a detailed, step-by-step action plan that is:
                        1. Specific and actionable
                        2. Prioritized by urgency and importance
                        3. Realistic and achievable
                        4. Personalized to patient circumstances
                        5. Time-bound with clear milestones
                        
                        Return your response as a structured JSON object with clear action items, timelines, and success criteria."""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 1200,
                "temperature": 0.3
            }
            
            response = await self._make_request("chat/completions", data)
            content = response["choices"][0]["message"]["content"]
            
            try:
                action_plan = json.loads(content)
                return {
                    "success": True,
                    "action_plan": action_plan,
                    "model_used": self.default_model
                }
            except json.JSONDecodeError:
                return {
                    "success": False,
                    "error": "Failed to parse action plan response",
                    "raw_response": content
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to generate action plan: {str(e)}"
            }
    
    def _build_comprehensive_assessment_prompt(
        self, 
        symptoms: List[Dict[str, Any]], 
        patient_profile: Dict[str, Any],
        medical_history: Optional[List[str]] = None,
        current_medications: Optional[List[str]] = None
    ) -> str:
        """Build comprehensive assessment prompt."""
        
        prompt = f"""
        CLINICAL ASSESSMENT REQUEST
        
        PATIENT PROFILE:
        - Age: {patient_profile.get('age', 'Unknown')}
        - Gender: {patient_profile.get('gender', 'Unknown')}
        - Weight: {patient_profile.get('weight', 'Unknown')}
        - Height: {patient_profile.get('height', 'Unknown')}
        
        CURRENT SYMPTOMS:
        """
        
        for i, symptom in enumerate(symptoms, 1):
            prompt += f"""
        Symptom {i}:
        - Location: {symptom.get('body_part', 'Unknown')}
        - Type: {symptom.get('type', 'Unknown')}
        - Intensity: {symptom.get('intensity', 'Unknown')}/10
        - Duration: {symptom.get('duration', 'Unknown')}
        - Onset: {symptom.get('onset', 'Unknown')}
        - Notes: {symptom.get('notes', 'None')}
        - Timestamp: {symptom.get('timestamp', 'Unknown')}
        """
        
        if medical_history:
            prompt += f"\nMEDICAL HISTORY:\n"
            for condition in medical_history:
                prompt += f"- {condition}\n"
        
        if current_medications:
            prompt += f"\nCURRENT MEDICATIONS:\n"
            for medication in current_medications:
                prompt += f"- {medication}\n"
        
        prompt += """
        
        Please provide a comprehensive clinical assessment following NICE guidelines and clinical best practices. 
        Consider the patient's age, medical history, and current symptoms to provide appropriate risk stratification, 
        differential diagnosis, and evidence-based recommendations.
        
        Focus on patient safety, appropriate escalation criteria, and clear next steps.
        """
        
        return prompt
    
    def _build_symptom_summary_prompt(self, symptoms: List[Dict[str, Any]], timeframe: str) -> str:
        """Build symptom summary prompt."""
        
        prompt = f"""
        SYMPTOM SUMMARY REQUEST - {timeframe.upper()} ANALYSIS
        
        SYMPTOM DATA:
        """
        
        for i, symptom in enumerate(symptoms, 1):
            prompt += f"""
        Entry {i}:
        - Date: {symptom.get('timestamp', 'Unknown')}
        - Location: {symptom.get('body_part', 'Unknown')}
        - Type: {symptom.get('type', 'Unknown')}
        - Intensity: {symptom.get('intensity', 'Unknown')}/10
        - Notes: {symptom.get('notes', 'None')}
        """
        
        prompt += f"""
        
        Please analyze these symptoms and provide a comprehensive summary including:
        1. Overall patterns and trends
        2. Severity progression
        3. Frequency analysis
        4. Potential correlations or triggers
        5. Areas of concern or improvement
        6. Recommendations for ongoing monitoring
        
        Return as structured JSON with clear insights and actionable recommendations.
        """
        
        return prompt
    
    def _build_action_plan_prompt(
        self, 
        assessment: Dict[str, Any], 
        patient_preferences: Optional[Dict[str, Any]] = None
    ) -> str:
        """Build action plan prompt."""
        
        prompt = f"""
        PERSONALIZED ACTION PLAN REQUEST
        
        CLINICAL ASSESSMENT SUMMARY:
        - Urgency Level: {assessment.get('urgency_level', 'Unknown')}
        - Risk Level: {assessment.get('risk_level', 'Unknown')}
        - Primary Concern: {assessment.get('primary_concern', 'Unknown')}
        - Recommendations: {assessment.get('recommendations', {})}
        """
        
        if patient_preferences:
            prompt += f"""
        
        PATIENT PREFERENCES:
        - Preferred contact method: {patient_preferences.get('contact_method', 'Unknown')}
        - Availability: {patient_preferences.get('availability', 'Unknown')}
        - Healthcare access: {patient_preferences.get('healthcare_access', 'Unknown')}
        - Mobility constraints: {patient_preferences.get('mobility_constraints', 'None')}
        """
        
        prompt += """
        
        Please create a detailed, personalized action plan that:
        1. Prioritizes actions by urgency and importance
        2. Provides specific, actionable steps
        3. Includes realistic timelines
        4. Considers patient preferences and constraints
        5. Defines success criteria and monitoring points
        
        Return as structured JSON with clear action items, timelines, and milestones.
        """
        
        return prompt

# Global instance
enhanced_clinical_ai_service = None

def get_enhanced_clinical_ai_service():
    """Get or create the Enhanced Clinical AI service instance"""
    global enhanced_clinical_ai_service
    if enhanced_clinical_ai_service is None:
        enhanced_clinical_ai_service = EnhancedClinicalAIService()
    return enhanced_clinical_ai_service