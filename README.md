# 🧬 Digital Twin Health Application

A full-stack Ayurvedic + Modern Nutrition Digital Twin system.

## 📁 Project Structure

```
digital_twin_project/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── routes/              # API route handlers
│   │   │   ├── user.py
│   │   │   ├── food.py
│   │   │   ├── dosha.py
│   │   │   ├── diet.py
│   │   │   └── simulation.py
│   │   ├── services/            # Business logic
│   │   │   ├── food_analyzer.py
│   │   │   ├── dosha_calculator.py
│   │   │   ├── diet_planner.py
│   │   │   ├── health_score.py
│   │   │   └── simulation_engine.py
│   │   ├── models/
│   │   │   └── schemas.py
│   │   ├── data/
│   │   │   └── final_food_dataset.xlsx   ← 881 foods
│   │   └── utils/
│   │       └── helpers.py
│   └── requirements.txt
└── frontend/
    ├── index.html      # Landing page
    ├── input.html      # Profile + Dosha Quiz
    ├── dashboard.html  # Health Dashboard
    ├── analyzer.html   # Food Analyzer + 3D Twin
    ├── diet.html       # 7-Day Diet Planner
    ├── chat.html       # AI Health Chat
    ├── css/
    │   └── styles.css
    └── js/
        ├── api.js
        ├── form.js
        ├── dashboard.js
        ├── analyzer.js
        ├── diet.js
        ├── chat.js
        └── three_body.js
```

---

## ▶️ Running the App

### 1. Backend (FastAPI)

```bash
cd digital_twin_project/backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API will start at: **http://localhost:8000**  
Swagger docs at:  **http://localhost:8000/docs**

### 2. Frontend

Simply open `frontend/index.html` in your browser.

> **Tip:** For local development, use VS Code Live Server or:
> ```bash
> cd digital_twin_project/frontend
> python -m http.server 3000
> # Open http://localhost:3000
> ```

---

## 🔗 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/user-data` | Submit health profile, get BMI + health score |
| POST | `/dosha-calc` | Calculate Ayurvedic dosha from quiz |
| GET | `/dosha-questions` | Get quiz questions |
| POST | `/food-analysis` | Analyze food compatibility |
| GET | `/food-search?q=` | Search food database |
| POST | `/diet-plan` | Generate 7-day diet plan |
| POST | `/simulation` | Run 12-week health simulation |
| GET | `/health-score` | Get health score breakdown |

---

## 🎯 Features

| Feature | Details |
|---------|---------|
| 🌿 Dosha Assessment | 5-question quiz → Vata / Pitta / Kapha |
| 🔬 Food Analyzer | 881-food DB with Ayurvedic + nutritional analysis |
| 🫀 3D Body Twin | Three.js rotating human model with organ highlighting |
| ⏳ Simulation | Week 1 / 4 / 12 health projections |
| 📅 Diet Planner | 7-day personalised meal plan with CSV export |
| 📊 Dashboard | Health score, BMI, risks, lifestyle vitals chart |
| 🤖 AI Chat | Claude AI assistant with fallback rule-based responses |
| 💾 Progress Tracking | localStorage persistence across sessions |

---

## 🔑 AI Chat

The chat assistant uses the Anthropic Claude API directly from the browser.
If the API is unreachable (no API key in browser context), it falls back to a rule-based health advisor.

For full AI capability, note that the Anthropic API requires authentication which is handled by the claude.ai artifact environment.

---

## 📦 Dependencies

**Backend:**
- FastAPI 0.111
- Uvicorn 0.30
- Pandas 2.2
- Openpyxl 3.1
- Pydantic 2.7

**Frontend:**
- Three.js r128 (CDN)
- Google Fonts: Outfit + DM Sans
- Pure HTML/CSS/JS — no build step needed