"""
Dosha calculator based on 5-question Ayurvedic questionnaire.
A answers → Vata, B → Pitta, C → Kapha
"""

def calculate_dosha(answers: dict) -> dict:
    counts = {"vata": 0, "pitta": 0, "kapha": 0}
    mapping = {"A": "vata", "B": "pitta", "C": "kapha"}
    for v in answers.values():
        dosha = mapping.get(v.upper())
        if dosha:
            counts[dosha] += 1
    dominant = max(counts, key=counts.get)
    total = sum(counts.values()) or 1
    percentages = {k: round(v / total * 100) for k, v in counts.items()}
    traits = {
        "vata": {
            "description": "Creative, energetic, quick-thinking. Prone to anxiety and dryness.",
            "recommended_foods": ["warm soups", "ghee", "root vegetables", "nuts", "warm milk"],
            "avoid_foods": ["raw salads", "cold drinks", "caffeine", "dry snacks"],
            "lifestyle": "Regular routine, warm environment, oil massages"
        },
        "pitta": {
            "description": "Intelligent, focused, strong digestion. Prone to inflammation and irritability.",
            "recommended_foods": ["cooling foods", "coconut", "cucumber", "mint", "coriander"],
            "avoid_foods": ["spicy food", "fried food", "alcohol", "tomatoes"],
            "lifestyle": "Avoid overheating, moderate exercise, cooling practices"
        },
        "kapha": {
            "description": "Calm, stable, compassionate. Prone to weight gain and sluggishness.",
            "recommended_foods": ["light grains", "vegetables", "legumes", "honey", "ginger"],
            "avoid_foods": ["dairy", "sweets", "cold food", "heavy meals"],
            "lifestyle": "Regular vigorous exercise, dry massage, stimulating activities"
        }
    }
    return {
        "dominant_dosha": dominant,
        "scores": counts,
        "percentages": percentages,
        **traits[dominant]
    }