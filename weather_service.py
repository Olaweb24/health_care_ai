import os
import requests
import logging
from typing import Dict, Optional

class WeatherService:
    def __init__(self):
        self.api_key = os.environ.get("WEATHER_API_KEY")
        self.base_url = "http://api.openweathermap.org/data/2.5"
        
    def get_weather_alerts(self, location: str) -> Optional[Dict]:
        """Get current weather data for location-based health alerts."""
        if not self.api_key:
            return self._get_fallback_weather_data(location)
        
        try:
            # Get current weather
            current_url = f"{self.base_url}/weather"
            params = {
                'q': location,
                'appid': self.api_key,
                'units': 'metric'
            }
            
            response = requests.get(current_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            weather_data = {
                'location': data['name'],
                'country': data['sys']['country'],
                'temperature': data['main']['temp'],
                'feels_like': data['main']['feels_like'],
                'humidity': data['main']['humidity'],
                'pressure': data['main']['pressure'],
                'weather_main': data['weather'][0]['main'],
                'weather_description': data['weather'][0]['description'],
                'wind_speed': data['wind']['speed'],
                'visibility': data.get('visibility', 10000) / 1000,  # Convert to km
                'uv_index': self._get_uv_index(data['coord']['lat'], data['coord']['lon'])
            }
            
            return weather_data
            
        except requests.exceptions.RequestException as e:
            logging.error(f"Weather API request failed: {e}")
            return self._get_fallback_weather_data(location)
        except (KeyError, ValueError) as e:
            logging.error(f"Weather data parsing error: {e}")
            return self._get_fallback_weather_data(location)
    
    def _get_uv_index(self, lat: float, lon: float) -> Optional[float]:
        """Get UV index for the location."""
        if not self.api_key:
            return None
        
        try:
            uv_url = f"{self.base_url}/uvi"
            params = {
                'lat': lat,
                'lon': lon,
                'appid': self.api_key
            }
            
            response = requests.get(uv_url, params=params, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            return data.get('value')
            
        except Exception as e:
            logging.error(f"UV index request failed: {e}")
            return None
    
    def _get_fallback_weather_data(self, location: str) -> Dict:
        """Provide fallback weather data when API is unavailable."""
        return {
            'location': location,
            'country': 'Unknown',
            'temperature': 22,
            'feels_like': 22,
            'humidity': 60,
            'pressure': 1013,
            'weather_main': 'Clear',
            'weather_description': 'clear sky',
            'wind_speed': 5,
            'visibility': 10,
            'uv_index': 5,
            'fallback': True
        }
