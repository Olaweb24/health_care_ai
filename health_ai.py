import os
import json
import logging
from typing import Dict, List, Any
from openai import OpenAI

class HealthAI:
    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None
        
    def get_personalized_tips(self, profile: Dict, recent_logs: List[Dict]) -> List[str]:
        """Generate personalized health tips based on user profile and recent logs."""
        if not self.client:
            return self._get_fallback_tips(profile)
        
        try:
            # Analyze user data
            user_context = self._build_user_context(profile, recent_logs)
            
            prompt = f"""
            You are a healthcare AI assistant. Based on the following user profile and recent lifestyle data, 
            provide 5 personalized preventive health tips. Focus on actionable advice that can improve their health.
            
            User Context: {user_context}
            
            Provide your response as a JSON object with this format:
            {{"tips": ["tip1", "tip2", "tip3", "tip4", "tip5"]}}
            """
            
            # the newest OpenAI model is "gpt-5" which was released August 7, 2025.
            # do not change this unless explicitly requested by the user
            response = self.client.chat.completions.create(
                model="gpt-5",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            if content:
                result = json.loads(content)
                return result.get("tips", self._get_fallback_tips(profile))
            else:
                return self._get_fallback_tips(profile)
            
        except Exception as e:
            logging.error(f"Error generating personalized tips: {e}")
            return self._get_fallback_tips(profile)
    
    def get_location_based_alerts(self, weather_data: Dict, profile: Dict) -> List[Dict]:
        """Generate location-based health alerts."""
        if not self.client or not weather_data:
            return self._get_fallback_alerts(weather_data)
        
        try:
            prompt = f"""
            You are a healthcare AI assistant. Based on the current weather conditions and user profile,
            identify potential health risks and provide preventive advice.
            
            Weather Data: {json.dumps(weather_data)}
            User Profile: Age {profile.get('age', 'unknown')}, Gender {profile.get('gender', 'unknown')}, Location {profile.get('location', 'unknown')}
            
            Provide your response as a JSON object with this format:
            {{"alerts": [{{"type": "warning/info", "title": "Alert Title", "message": "Alert message"}}]}}
            """
            
            response = self.client.chat.completions.create(
                model="gpt-5",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            if content:
                result = json.loads(content)
                return result.get("alerts", self._get_fallback_alerts(weather_data))
            else:
                return self._get_fallback_alerts(weather_data)
            
        except Exception as e:
            logging.error(f"Error generating location alerts: {e}")
            return self._get_fallback_alerts(weather_data)
    
    def get_comprehensive_health_tips(self, profile: Dict, recent_logs: List[Dict]) -> Dict:
        """Get comprehensive health tips organized by category."""
        if not self.client:
            return self._get_fallback_comprehensive_tips()
        
        try:
            user_context = self._build_user_context(profile, recent_logs)
            
            prompt = f"""
            You are a healthcare AI assistant. Based on the user's profile and lifestyle data,
            provide comprehensive health tips organized by category.
            
            User Context: {user_context}
            
            Provide your response as a JSON object with this format:
            {{
                "nutrition": ["tip1", "tip2", "tip3"],
                "exercise": ["tip1", "tip2", "tip3"],
                "sleep": ["tip1", "tip2", "tip3"],
                "mental_health": ["tip1", "tip2", "tip3"],
                "preventive_care": ["tip1", "tip2", "tip3"]
            }}
            """
            
            response = self.client.chat.completions.create(
                model="gpt-5",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            if content:
                result = json.loads(content)
                return result
            else:
                return self._get_fallback_comprehensive_tips()
            
        except Exception as e:
            logging.error(f"Error generating comprehensive tips: {e}")
            return self._get_fallback_comprehensive_tips()
    
    def get_detailed_location_alerts(self, weather_data: Dict, profile: Dict) -> List[Dict]:
        """Get detailed location-based health alerts."""
        if not self.client:
            return self._get_fallback_detailed_alerts()
        
        try:
            prompt = f"""
            You are a healthcare AI assistant. Analyze current weather conditions and provide detailed health alerts.
            
            Weather Data: {json.dumps(weather_data)}
            User Profile: {json.dumps(profile)}
            
            Focus on:
            - Temperature-related health risks
            - Humidity and air quality concerns
            - Seasonal disease prevention
            - Activity recommendations
            
            Provide your response as a JSON object with this format:
            {{
                "alerts": [
                    {{
                        "type": "warning/info/danger",
                        "category": "Temperature/Air Quality/Disease Prevention/Activity",
                        "title": "Alert Title",
                        "message": "Detailed alert message",
                        "recommendations": ["recommendation1", "recommendation2"]
                    }}
                ]
            }}
            """
            
            response = self.client.chat.completions.create(
                model="gpt-5",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            if content:
                result = json.loads(content)
                return result.get("alerts", self._get_fallback_detailed_alerts())
            else:
                return self._get_fallback_detailed_alerts()
            
        except Exception as e:
            logging.error(f"Error generating detailed alerts: {e}")
            return self._get_fallback_detailed_alerts()
    
    def chat_response(self, message: str, profile: Dict) -> str:
        """Generate a response to user's health-related question."""
        if not self.client:
            return self._get_fallback_chat_response(message)
        
        try:
            system_prompt = f"""
            You are a helpful healthcare AI assistant. Answer health-related questions with accurate, 
            helpful information while emphasizing that you're not replacing professional medical advice.
            
            User Profile: Age {profile.get('age', 'unknown')}, Gender {profile.get('gender', 'unknown')}
            
            Guidelines:
            - Provide helpful, evidence-based health information
            - Always recommend consulting healthcare professionals for serious concerns
            - Be supportive and encouraging
            - Keep responses concise but informative
            """
            
            response = self.client.chat.completions.create(
                model="gpt-5",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ]
            )
            
            content = response.choices[0].message.content
            return content if content else self._get_fallback_chat_response(message)
            
        except Exception as e:
            logging.error(f"Error generating chat response: {e}")
            return self._get_fallback_chat_response(message)
    
    def _build_user_context(self, profile: Dict, recent_logs: List[Dict]) -> str:
        """Build user context string for AI prompts."""
        context = f"Age: {profile.get('age', 'unknown')}, Gender: {profile.get('gender', 'unknown')}, "
        context += f"Location: {profile.get('location', 'unknown')}, "
        context += f"Exercise Frequency: {profile.get('exercise_frequency', 'unknown')}, "
        context += f"Typical Sleep: {profile.get('sleep_hours', 'unknown')} hours, "
        context += f"Diet Type: {profile.get('diet_type', 'unknown')}"
        
        if recent_logs:
            avg_sleep = sum(log.get('sleep_hours', 0) for log in recent_logs) / len(recent_logs)
            avg_exercise = sum(log.get('exercise_minutes', 0) for log in recent_logs) / len(recent_logs)
            avg_water = sum(log.get('water_glasses', 0) for log in recent_logs) / len(recent_logs)
            
            context += f"\nRecent averages: Sleep: {avg_sleep:.1f}h, Exercise: {avg_exercise:.0f}min, Water: {avg_water:.0f} glasses"
        
        return context
    
    def _get_fallback_tips(self, profile: Dict) -> List[str]:
        """Provide fallback tips when AI is unavailable."""
        tips = [
            "Stay hydrated by drinking at least 8 glasses of water daily",
            "Aim for 7-9 hours of quality sleep each night",
            "Include at least 30 minutes of physical activity in your daily routine",
            "Eat a balanced diet rich in fruits, vegetables, and whole grains",
            "Practice stress management techniques like deep breathing or meditation"
        ]
        
        # Customize based on profile
        if profile.get('age', 0) > 50:
            tips.append("Schedule regular health check-ups and screenings")
        
        if profile.get('sleep_hours', 8) < 7:
            tips.append("Focus on improving your sleep quality and duration")
        
        return tips
    
    def _get_fallback_alerts(self, weather_data: Dict) -> List[Dict]:
        """Provide fallback alerts when AI is unavailable."""
        alerts = []
        
        if weather_data.get('temperature', 20) > 30:
            alerts.append({
                'type': 'warning',
                'title': 'High Temperature Alert',
                'message': 'Stay hydrated and avoid prolonged sun exposure'
            })
        
        if weather_data.get('humidity', 50) > 80:
            alerts.append({
                'type': 'info',
                'title': 'High Humidity',
                'message': 'Take breaks in air-conditioned spaces when possible'
            })
        
        return alerts
    
    def _get_fallback_comprehensive_tips(self) -> Dict:
        """Provide fallback comprehensive tips."""
        return {
            "nutrition": [
                "Eat 5 servings of fruits and vegetables daily",
                "Choose whole grains over refined grains",
                "Limit processed foods and added sugars"
            ],
            "exercise": [
                "Aim for 150 minutes of moderate exercise weekly",
                "Include strength training 2-3 times per week",
                "Take regular breaks from sitting"
            ],
            "sleep": [
                "Maintain a consistent sleep schedule",
                "Create a relaxing bedtime routine",
                "Keep your bedroom cool and dark"
            ],
            "mental_health": [
                "Practice mindfulness or meditation",
                "Stay connected with friends and family",
                "Seek help when feeling overwhelmed"
            ],
            "preventive_care": [
                "Schedule regular check-ups with your doctor",
                "Stay up-to-date with vaccinations",
                "Monitor your vital signs regularly"
            ]
        }
    
    def _get_fallback_detailed_alerts(self) -> List[Dict]:
        """Provide fallback detailed alerts."""
        return [
            {
                'type': 'info',
                'category': 'General Health',
                'title': 'Daily Health Reminder',
                'message': 'Remember to stay hydrated and maintain your daily health routines',
                'recommendations': ['Drink plenty of water', 'Get adequate sleep', 'Stay active']
            }
        ]
    
    def _get_fallback_chat_response(self, message: str) -> str:
        """Provide fallback chat response."""
        return ("I understand you're asking about health topics. While I'd love to help, "
                "I recommend consulting with a qualified healthcare professional for personalized advice. "
                "In the meantime, focus on the basics: stay hydrated, get enough sleep, eat well, "
                "and stay active. Is there anything specific about your lifestyle habits I can help you track?")
