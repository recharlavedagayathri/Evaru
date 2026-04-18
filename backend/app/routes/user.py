from fastapi import APIRouter
from app.models.schemas import UserData
from app.utils.helpers import calculate_bmi, bmi_category
from app.services.health_score import calculate_health_score

router = APIRouter()

@router.post("/user-data")
async def submit_user_data(data: UserData):
    bmi = calculate_bmi(data.weight, data.height)
    cat = bmi_category(bmi)
    user_dict = data.dict()
    user_dict["bmi"] = bmi
    score_data = calculate_health_score(user_dict)
    return {
        "success": True,
        "bmi": bmi,
        "bmi_category": cat,
        "health_score": score_data,
        "user": user_dict
    }