from pydantic import BaseModel
from typing import Optional, List

class UserData(BaseModel):
    age: int
    gender: str
    height: float  # cm
    weight: float  # kg
    diabetes: bool = False
    hypertension: bool = False
    family_diabetes: bool = False
    family_heart: bool = False
    medications: Optional[str] = ""
    steps_per_day: int = 5000
    exercise_hours_week: float = 3.0
    sleep_hours: float = 7.0
    stress_level: int = 5  # 1-10

class DoshaAnswers(BaseModel):
    q1: str  # A/B/C
    q2: str
    q3: str
    q4: str
    q5: str

class FoodAnalysisRequest(BaseModel):
    food_name: str
    dosha: str  # vata/pitta/kapha
    diabetes: bool = False
    hypertension: bool = False

class SimulationRequest(BaseModel):
    food_name: str
    dosha: str
    diabetes: bool = False
    hypertension: bool = False
    consumption_frequency: str = "daily"  # daily/weekly/occasional

class DietPlanRequest(BaseModel):
    bmi: float
    dosha: str
    diabetes: bool = False
    hypertension: bool = False
    age: int = 30
    gender: str = "male"