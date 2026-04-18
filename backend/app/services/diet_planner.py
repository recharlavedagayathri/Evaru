"""Weekly diet planner based on BMI, dosha, and conditions."""

DIET_PLANS = {
    "vata": {
        "breakfast": ["Warm oatmeal with ghee and dates", "Scrambled eggs with toast", "Banana smoothie with almond milk",
                      "Upma with vegetables", "Rice porridge with jaggery", "Warm sooji halwa", "Moong dal dosa"],
        "lunch": ["Khichdi with ghee", "Rajma rice", "Spinach dal with roti", "Vegetable biryani",
                  "Chicken curry with rice", "Palak paneer with roti", "Lentil soup with bread"],
        "dinner": ["Vegetable soup with bread", "Masoor dal with rice", "Roti with sabzi", "Warm quinoa bowl",
                   "Paneer tikka masala", "Chicken stew with rice", "Mung bean soup"],
        "snacks": ["Warm milk with turmeric", "Almonds and dates", "Banana", "Sesame seeds", "Ghee roasted nuts"]
    },
    "pitta": {
        "breakfast": ["Coconut milk oats", "Cucumber smoothie", "Cool fruit salad", "Poha with coconut",
                      "Coriander chutney toast", "Mint lassi with rice flakes", "Coconut rice"],
        "lunch": ["Cucumber raita with rice", "Mixed vegetable curry (mild)", "Toor dal with chapati",
                  "Grilled fish with salad", "Chickpea salad", "Moong dal with rice", "Vegetable khichdi"],
        "dinner": ["Cool salad with light dressing", "Mung soup", "Barley khichdi", "Steamed vegetables with roti",
                   "Light chicken broth", "Tofu stir fry", "Lentil stew"],
        "snacks": ["Coconut water", "Pomegranate", "Cucumber slices", "Sweet grapes", "Cool mint tea"]
    },
    "kapha": {
        "breakfast": ["Ginger lemon water then light fruit", "Ragi roti with vegetable", "Moong sprout salad",
                      "Light poha", "Steamed idli with sambar", "Oats with honey", "Mixed grain porridge"],
        "lunch": ["Light dal with brown rice", "Grilled chicken salad", "Vegetable soup",
                  "Quinoa bowl with vegetables", "Methi roti with dal", "Corn soup", "Bean salad"],
        "dinner": ["Steamed vegetables", "Clear broth soup", "Light vegetable stir fry", "Moong dal soup",
                   "Grilled fish", "Mixed lentil soup", "Vegetable clear soup"],
        "snacks": ["Ginger tea", "Honey water", "Puffed rice", "Apple slices", "Light roasted makhana"]
    }
}

BMI_ADJUSTMENTS = {
    "Underweight": {"note": "High calorie foods included", "calorie_modifier": 1.3},
    "Normal": {"note": "Balanced calorie intake", "calorie_modifier": 1.0},
    "Overweight": {"note": "Calorie-controlled portions", "calorie_modifier": 0.85},
    "Obese": {"note": "Strict calorie control", "calorie_modifier": 0.7}
}

def generate_diet_plan(bmi: float, dosha: str, diabetes: bool = False, hypertension: bool = False) -> dict:
    if bmi < 18.5: bmi_cat = "Underweight"
    elif bmi < 25: bmi_cat = "Normal"
    elif bmi < 30: bmi_cat = "Overweight"
    else: bmi_cat = "Obese"

    plan_source = DIET_PLANS.get(dosha.lower(), DIET_PLANS["vata"])
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    weekly_plan = []
    for i, day in enumerate(days):
        meals = {
            "breakfast": plan_source["breakfast"][i],
            "lunch": plan_source["lunch"][i],
            "dinner": plan_source["dinner"][i],
            "snacks": plan_source["snacks"][i % len(plan_source["snacks"])]
        }
        if diabetes:
            meals["note"] = "Low GI options — avoid sugar and refined carbs"
        if hypertension:
            meals["note"] = meals.get("note", "") + " | Low sodium — avoid pickles and processed foods"
        weekly_plan.append({"day": day, "meals": meals})

    guidelines = []
    if dosha == "vata":
        guidelines = ["Prefer warm, cooked foods", "Use healthy fats like ghee", "Eat at regular times", "Avoid raw vegetables at night"]
    elif dosha == "pitta":
        guidelines = ["Favor cooling foods", "Avoid spicy and fried foods", "Eat in a calm environment", "Include coconut and mint regularly"]
    else:
        guidelines = ["Prefer light, warm foods", "Avoid heavy dairy and sweets", "Exercise before meals", "Eat smallest meal at dinner"]

    if diabetes:
        guidelines.append("Monitor blood sugar before and after meals")
        guidelines.append("Choose low glycemic index foods")
    if hypertension:
        guidelines.append("Limit salt to 1 teaspoon per day")
        guidelines.append("Increase potassium-rich foods like banana and spinach")

    adj = BMI_ADJUSTMENTS[bmi_cat]

    return {
        "dosha": dosha,
        "bmi": bmi,
        "bmi_category": bmi_cat,
        "calorie_note": adj["note"],
        "calorie_modifier": adj["calorie_modifier"],
        "weekly_plan": weekly_plan,
        "guidelines": guidelines,
        "water_intake_liters": round(2.0 + (bmi - 22) * 0.05, 1)
    }