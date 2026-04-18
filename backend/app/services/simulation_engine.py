"""Simulates long-term health effects of food consumption."""

def simulate_effects(food_analysis: dict, frequency: str) -> dict:
    base_risk = food_analysis.get("risk_score", 0)
    color = food_analysis.get("color", "green")
    organs = food_analysis.get("affected_organs", [])

    freq_multiplier = {"daily": 1.0, "weekly": 0.5, "occasional": 0.2}.get(frequency, 1.0)
    adjusted = base_risk * freq_multiplier

    def week_state(weeks):
        cumulative = adjusted * (weeks / 4)
        if cumulative < 20:
            return "normal", "No significant changes detected"
        elif cumulative < 50:
            return "moderate", "Mild changes beginning — monitor closely"
        elif cumulative < 75:
            return "warning", "Noticeable physiological stress"
        else:
            return "critical", "High risk — immediate dietary change advised"

    w1_status, w1_msg = week_state(1)
    w4_status, w4_msg = week_state(4)
    w12_status, w12_msg = week_state(12)

    organ_progression = {}
    for organ in organs:
        organ_progression[organ] = {
            "week1": round(min(100, adjusted * 0.3), 1),
            "week4": round(min(100, adjusted * 1.2), 1),
            "week12": round(min(100, adjusted * 3.5), 1)
        }

    biomarkers = {
        "blood_glucose": {"week1": 95, "week4": 95 + adjusted * 0.3, "week12": 95 + adjusted * 0.9},
        "blood_pressure": {"week1": 120, "week4": 120 + adjusted * 0.15, "week12": 120 + adjusted * 0.45},
        "cholesterol": {"week1": 180, "week4": 180 + adjusted * 0.5, "week12": 180 + adjusted * 1.5},
        "inflammation": {"week1": 1.0, "week4": 1.0 + adjusted * 0.02, "week12": 1.0 + adjusted * 0.06}
    }

    return {
        "food": food_analysis.get("food_name", ""),
        "frequency": frequency,
        "timeline": {
            "week1": {"status": w1_status, "message": w1_msg, "risk": round(adjusted * 0.3, 1)},
            "week4": {"status": w4_status, "message": w4_msg, "risk": round(adjusted * 1.2, 1)},
            "week12": {"status": w12_status, "message": w12_msg, "risk": round(adjusted * 3.5, 1)}
        },
        "organ_progression": organ_progression,
        "biomarker_projection": biomarkers,
        "summary": f"At {frequency} consumption, this food has {'low' if adjusted < 20 else 'moderate' if adjusted < 50 else 'high'} long-term impact."
    }