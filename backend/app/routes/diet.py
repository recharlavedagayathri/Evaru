from fastapi import APIRouter
from app.models.schemas import DietPlanRequest
from app.services.diet_planner import generate_diet_plan

router = APIRouter()

@router.post("/diet-plan")
async def diet_plan(req: DietPlanRequest):
    plan = generate_diet_plan(req.bmi, req.dosha, req.diabetes, req.hypertension)
    return {"success": True, **plan}

@router.get("/diet-plan")
async def diet_plan_get(bmi: float = 22.0, dosha: str = "vata", diabetes: bool = False, hypertension: bool = False):
    plan = generate_diet_plan(bmi, dosha, diabetes, hypertension)
    return {"success": True, **plan}