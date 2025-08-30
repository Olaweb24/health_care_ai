"""
Data models for the healthcare application.
This file defines the structure of our in-memory data storage.
"""

from datetime import datetime
from typing import Dict, List, Optional

class User:
    def __init__(self, id: int, name: str, email: str, password_hash: str):
        self.id = id
        self.name = name
        self.email = email
        self.password_hash = password_hash
        self.created_at = datetime.now()

class UserProfile:
    def __init__(self, user_id: int, age: int, gender: str, location: str, 
                 exercise_frequency: str, sleep_hours: int, diet_type: str):
        self.user_id = user_id
        self.age = age
        self.gender = gender
        self.location = location
        self.exercise_frequency = exercise_frequency
        self.sleep_hours = sleep_hours
        self.diet_type = diet_type

class LifestyleLog:
    def __init__(self, user_id: int, date: str, sleep_hours: float, 
                 exercise_minutes: int, water_glasses: int, meals: str, notes: str = ""):
        self.user_id = user_id
        self.date = date
        self.sleep_hours = sleep_hours
        self.exercise_minutes = exercise_minutes
        self.water_glasses = water_glasses
        self.meals = meals
        self.notes = notes
        self.logged_at = datetime.now()
