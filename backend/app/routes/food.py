from fastapi import APIRouter
from app.models.schemas import DoshaAnswers
from app.services.dosha_calculator import calculate_dosha

router = APIRouter()

@router.post("/dosha-calc")
async def calc_dosha(answers: DoshaAnswers):
    result = calculate_dosha(answers.dict())
    return {"success": True, **result}

@router.get("/dosha-questions")
async def get_questions():
    return {
        "questions": [
            {
                "id": "q1", "question": "My body frame is...",
                "options": {"A": "Thin, light, small bones", "B": "Medium, athletic build", "C": "Large, heavy, solid"}
            },
            {
                "id": "q2", "question": "My skin is naturally...",
                "options": {"A": "Dry, rough, cool", "B": "Warm, oily, sensitive", "C": "Thick, moist, cool"}
            },
            {
                "id": "q3", "question": "My digestion is...",
                "options": {"A": "Irregular, variable", "B": "Strong, intense, can overeat", "C": "Slow but steady"}
            },
            {
                "id": "q4", "question": "Under stress, I tend to...",
                "options": {"A": "Worry and feel anxious", "B": "Get irritated and angry", "C": "Withdraw and become stubborn"}
            },
            {
                "id": "q5", "question": "My energy levels are...",
                "options": {"A": "Fluctuating, quick bursts", "B": "Intense and focused", "C": "Steady but can be sluggish"}
            }
        ]
    }