import pandas as pd
import os

_df = None

def _load_data():
    global _df
    if _df is None:
        data_path = os.path.join(os.path.dirname(__file__), "../data/final_food_dataset.xlsx")
        _df = pd.read_excel(data_path)
        _df.columns = [c.strip() for c in _df.columns]
    return _df

def search_food(query: str) -> list:
    df = _load_data()
    mask = df["food_name"].str.lower().str.contains(query.lower(), na=False)
    results = df[mask]["food_name"].dropna().tolist()
    return results[:10]

def analyze_food(food_name: str, dosha: str, diabetes: bool = False, hypertension: bool = False) -> dict:
    df = _load_data()
    mask = df["food_name"].str.lower() == food_name.lower()
    rows = df[mask]
    if rows.empty:
        # fuzzy match
        mask2 = df["food_name"].str.lower().str.contains(food_name.lower(), na=False)
        rows = df[mask2].head(1)
    if rows.empty:
        return {"error": f"Food '{food_name}' not found in database"}

    row = rows.iloc[0]

    def safe(col, default=0):
        try:
            v = row.get(col, default)
            return float(v) if pd.notna(v) else default
        except:
            return default

    def safe_str(col, default=""):
        try:
            v = row.get(col, default)
            return str(v) if pd.notna(v) else default
        except:
            return default

    sugar = safe("sugar")
    sodium = safe("sodium")
    fat = safe("fat")
    calories = safe("calories")
    gi = safe("glycemic_index")
    is_fried = safe("is_fried")
    is_processed = safe("is_processed")
    is_spicy = safe("is_spicy")
    inflammatory = safe("inflammatory_score")

    # dosha effect columns
    dosha_col_map = {"vata": "vata_effect", "pitta": "pitta_effect", "kapha": "kapha_effect"}
    dosha_effect = safe_str(dosha_col_map.get(dosha, "vata_effect"), "neutral")

    # Determine suitability and affected organs
    reasons = []
    affected_organs = []
    risk_score = 0

    # Sugar analysis
    if sugar > 10:
        reasons.append(f"High sugar content ({sugar}g) - impacts blood glucose")
        affected_organs.append("pancreas")
        risk_score += 25
    elif sugar > 5:
        reasons.append(f"Moderate sugar ({sugar}g) - consume mindfully")
        risk_score += 10

    # Sodium analysis
    if sodium > 400:
        reasons.append(f"High sodium ({sodium}mg) - may raise blood pressure")
        affected_organs.append("heart")
        risk_score += 25
    elif sodium > 200:
        reasons.append(f"Moderate sodium ({sodium}mg)")
        risk_score += 10

    # Fat analysis
    if fat > 15:
        reasons.append(f"High fat content ({fat}g) - impacts liver & cholesterol")
        affected_organs.append("liver")
        risk_score += 20

    # Dosha check
    dosha_val = safe(dosha_col_map.get(dosha, "vata_effect"))
    if dosha_val < 0:
        reasons.append(f"Aggravates your {dosha} dosha - may cause imbalance")
        affected_organs.append("nervous system") if dosha == "vata" else None
        risk_score += 20
    elif dosha_val > 0:
        reasons.append(f"Balances your {dosha} dosha - beneficial for your type")
        risk_score -= 10

    # Disease-specific
    if diabetes and gi > 70:
        reasons.append(f"High glycemic index ({gi}) - not recommended for diabetics")
        affected_organs.append("pancreas")
        risk_score += 30
    if hypertension and sodium > 300:
        reasons.append("High sodium - risky for hypertension patients")
        if "heart" not in affected_organs:
            affected_organs.append("heart")
        risk_score += 25

    if is_fried:
        reasons.append("Fried food - increases oxidative stress")
        if "liver" not in affected_organs:
            affected_organs.append("liver")
        risk_score += 15
    if is_processed:
        reasons.append("Processed food - contains preservatives")
        risk_score += 10
    if inflammatory > 0:
        reasons.append("May trigger inflammatory response")
        risk_score += 10

    if not reasons:
        reasons.append("Well-balanced food suitable for regular consumption")

    # Color classification
    risk_score = max(0, min(100, risk_score))
    if risk_score >= 50:
        color = "red"
        status = "Harmful"
    elif risk_score >= 25:
        color = "yellow"
        status = "Moderate"
    else:
        color = "green"
        status = "Safe"

    return {
        "food_name": safe_str("food_name", food_name),
        "category": safe_str("category"),
        "color": color,
        "status": status,
        "risk_score": risk_score,
        "reasons": reasons,
        "affected_organs": list(set(affected_organs)),
        "nutrition": {
            "calories": calories,
            "protein": safe("protein"),
            "carbs": safe("carbs"),
            "fat": fat,
            "sugar": sugar,
            "fiber": safe("fiber"),
            "sodium": sodium
        },
        "ayurveda": {
            "dosha_effect": dosha_effect,
            "rasa": safe_str("ayurveda_rasa"),
            "guna": safe_str("ayurveda_guna"),
            "virya": safe_str("ayurveda_virya")
        },
        "health_tags": safe_str("health_tags"),
        "contraindications": safe_str("contraindications"),
        "glycemic_index": gi,
        "is_processed": bool(is_processed),
        "is_fried": bool(is_fried),
        "is_spicy": bool(is_spicy)
    }

def get_all_foods() -> list:
    df = _load_data()
    return df["food_name"].dropna().tolist()