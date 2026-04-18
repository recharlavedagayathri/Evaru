from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import user, dosha, food, diet, simulation

app = FastAPI(
    title="Digital Twin Health API",
    description="Ayurvedic Digital Twin Health System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router, tags=["User"])
app.include_router(dosha.router, tags=["Dosha"])
app.include_router(food.router, tags=["Food"])
app.include_router(diet.router, tags=["Diet"])
app.include_router(simulation.router, tags=["Simulation"])

@app.get("/")
async def root():
    return {"message": "Digital Twin Health API is running", "docs": "/docs"}

@app.get("/health-score")
async def health_score_endpoint(
    bmi: float = 22.0, diabetes: bool = False, hypertension: bool = False,
    steps_per_day: int = 5000, sleep_hours: float = 7.0, stress_level: int = 5,
    exercise_hours_week: float = 3.0
):
    from app.services.health_score import calculate_health_score
    return calculate_health_score({
        "bmi": bmi, "diabetes": diabetes, "hypertension": hypertension,
        "steps_per_day": steps_per_day, "sleep_hours": sleep_hours,
        "stress_level": stress_level, "exercise_hours_week": exercise_hours_week
    })