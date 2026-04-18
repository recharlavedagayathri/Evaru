from fastapi import APIRouter
from app.models.schemas import SimulationRequest
from app.services.food_analyzer import analyze_food
from app.services.simulation_engine import simulate_effects

router = APIRouter()

@router.post("/simulation")
async def run_simulation(req: SimulationRequest):
    food_data = analyze_food(req.food_name, req.dosha, req.diabetes, req.hypertension)
    if "error" in food_data:
        return {"success": False, "error": food_data["error"]}
    simulation = simulate_effects(food_data, req.consumption_frequency)
    return {"success": True, "food_analysis": food_data, "simulation": simulation}