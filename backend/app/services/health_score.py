"""Health score calculator (0-100)."""

def calculate_health_score(user_data: dict) -> dict:
    score = 100
    risks = []

    bmi = user_data.get("bmi", 22)
    if bmi < 18.5:
        score -= 10; risks.append({"label": "Underweight BMI", "level": "moderate"})
    elif bmi > 30:
        score -= 20; risks.append({"label": "Obese BMI", "level": "high"})
    elif bmi > 25:
        score -= 10; risks.append({"label": "Overweight BMI", "level": "moderate"})

    if user_data.get("diabetes"):
        score -= 15; risks.append({"label": "Diabetes", "level": "high"})
    if user_data.get("hypertension"):
        score -= 15; risks.append({"label": "Hypertension", "level": "high"})

    steps = user_data.get("steps_per_day", 5000)
    if steps < 3000:
        score -= 15; risks.append({"label": "Very low activity", "level": "high"})
    elif steps < 7000:
        score -= 5; risks.append({"label": "Low activity", "level": "moderate"})
    elif steps > 10000:
        score += 5

    sleep = user_data.get("sleep_hours", 7)
    if sleep < 6:
        score -= 10; risks.append({"label": "Poor sleep", "level": "high"})
    elif sleep > 9:
        score -= 5; risks.append({"label": "Excessive sleep", "level": "low"})

    stress = user_data.get("stress_level", 5)
    if stress >= 8:
        score -= 15; risks.append({"label": "Very high stress", "level": "high"})
    elif stress >= 6:
        score -= 8; risks.append({"label": "High stress", "level": "moderate"})

    exercise = user_data.get("exercise_hours_week", 3)
    if exercise < 1:
        score -= 10; risks.append({"label": "No exercise", "level": "high"})
    elif exercise >= 5:
        score += 5

    score = max(0, min(100, score))

    if score >= 80: grade = "Excellent"
    elif score >= 60: grade = "Good"
    elif score >= 40: grade = "Fair"
    else: grade = "Poor"

    recommendations = []
    if bmi > 25: recommendations.append("Work on reducing BMI through diet and exercise")
    if steps < 7000: recommendations.append("Aim for 10,000 steps daily")
    if sleep < 7: recommendations.append("Improve sleep to 7-8 hours per night")
    if stress >= 6: recommendations.append("Practice stress management techniques")
    if exercise < 3: recommendations.append("Exercise at least 150 minutes per week")
    if user_data.get("diabetes"): recommendations.append("Monitor blood glucose regularly and follow diabetic diet")
    if user_data.get("hypertension"): recommendations.append("Limit sodium intake and monitor blood pressure")

    return {
        "score": score,
        "grade": grade,
        "risks": risks,
        "recommendations": recommendations,
        "breakdown": {
            "bmi_score": max(0, 25 - abs(bmi - 22) * 2),
            "activity_score": min(25, steps / 400),
            "sleep_score": max(0, 25 - abs(sleep - 7.5) * 5),
            "stress_score": max(0, 25 - stress * 2)
        }
    }