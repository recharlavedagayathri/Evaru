// form.js — input.html logic

// Live BMI preview
["height","weight"].forEach(id => {
  document.getElementById(id).addEventListener("input", updateBMI);
});
function updateBMI() {
  const h = parseFloat(document.getElementById("height").value);
  const w = parseFloat(document.getElementById("weight").value);
  if (!h || !w) return;
  const bmi = (w / ((h/100)**2)).toFixed(1);
  let cat = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
  const el = document.getElementById("bmi-preview");
  el.style.display = "block";
  document.getElementById("bmi-val").textContent = bmi;
  document.getElementById("bmi-cat").textContent = cat;
  el.className = "card mt-2 " + (bmi < 25 ? "bg-green" : bmi < 30 ? "bg-yellow" : "bg-red");
}

let questions = [];

async function submitStep1() {
  const age = parseInt(document.getElementById("age").value);
  const h = parseFloat(document.getElementById("height").value);
  const w = parseFloat(document.getElementById("weight").value);
  if (!age || !h || !w) { toast("Please fill all required fields", "error"); return; }

  const userData = {
    age, gender: document.getElementById("gender").value,
    height: h, weight: w,
    diabetes: document.getElementById("diabetes").checked,
    hypertension: document.getElementById("hypertension").checked,
    family_diabetes: document.getElementById("fam_diabetes").checked,
    family_heart: document.getElementById("fam_heart").checked,
    medications: document.getElementById("medications").value,
    steps_per_day: parseInt(document.getElementById("steps").value),
    exercise_hours_week: parseFloat(document.getElementById("exercise").value),
    sleep_hours: parseFloat(document.getElementById("sleep").value),
    stress_level: parseInt(document.getElementById("stress").value)
  };

  showLoading("Saving your profile…");
  try {
    const res = await apiPost("/user-data", userData);
    userData.bmi = res.bmi;
    userData.bmi_category = res.bmi_category;
    userData.health_score_data = res.health_score;
    Store.set("user", userData);
    hideLoading();
    // load quiz questions
    const qres = await apiGet("/dosha-questions");
    questions = qres.questions;
    renderQuiz();
    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";
    setStepIndicator(2);
    toast("Profile saved! Now take the dosha quiz 🌿");
  } catch(e) {
    hideLoading();
    toast("Backend not reachable — saving locally", "error");
    const h2 = parseFloat(document.getElementById("height").value);
    const w2 = parseFloat(document.getElementById("weight").value);
    userData.bmi = parseFloat((w2/((h2/100)**2)).toFixed(1));
    Store.set("user", userData);
    // still proceed with hardcoded questions
    questions = hardcodedQuestions();
    renderQuiz();
    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";
    setStepIndicator(2);
  }
}

function hardcodedQuestions() {
  return [
    { id:"q1", question:"My body frame is…",
      options:{A:"Thin, light, small bones",B:"Medium, athletic build",C:"Large, heavy, solid"} },
    { id:"q2", question:"My skin is naturally…",
      options:{A:"Dry, rough, cool",B:"Warm, oily, sensitive",C:"Thick, moist, cool"} },
    { id:"q3", question:"My digestion is…",
      options:{A:"Irregular, variable",B:"Strong, intense, can overeat",C:"Slow but steady"} },
    { id:"q4", question:"Under stress, I tend to…",
      options:{A:"Worry and feel anxious",B:"Get irritated and angry",C:"Withdraw and become stubborn"} },
    { id:"q5", question:"My energy levels are…",
      options:{A:"Fluctuating, quick bursts",B:"Intense and focused",C:"Steady but can be sluggish"} }
  ];
}

function renderQuiz() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = questions.map((q, i) => `
    <div style="margin-bottom:1.5rem">
      <p style="font-weight:600;margin-bottom:0.6rem">${i+1}. ${q.question}</p>
      <div class="radio-cards">
        ${Object.entries(q.options).map(([key, label]) => `
          <label class="radio-card" onclick="selectRadio(this)">
            <input type="radio" name="${q.id}" value="${key}"/>
            <span class="badge badge-green" style="min-width:26px;text-align:center">${key}</span>
            ${label}
          </label>
        `).join("")}
      </div>
    </div>
  `).join("");
}

function selectRadio(label) {
  const name = label.querySelector("input").name;
  document.querySelectorAll(`[name="${name}"]`).forEach(r => r.closest(".radio-card").classList.remove("selected"));
  label.classList.add("selected");
}

async function submitDosha() {
  const answers = {};
  for (const q of questions) {
    const sel = document.querySelector(`input[name="${q.id}"]:checked`);
    if (!sel) { toast("Please answer all questions", "error"); return; }
    answers[q.id] = sel.value;
  }

  showLoading("Calculating your dosha…");
  let dosha;
  try {
    dosha = await apiPost("/dosha-calc", answers);
  } catch(e) {
    // fallback calculation
    const counts = {vata:0,pitta:0,kapha:0};
    const m = {A:"vata",B:"pitta",C:"kapha"};
    Object.values(answers).forEach(v => counts[m[v]]++);
    const dom = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];
    const total = Object.values(counts).reduce((s,v)=>s+v,0);
    dosha = { dominant_dosha: dom,
      scores: counts,
      percentages: Object.fromEntries(Object.entries(counts).map(([k,v])=>[k,Math.round(v/total*100)])),
      description: "Based on your answers", recommended_foods:[], avoid_foods:[], lifestyle:"" };
  }
  hideLoading();

  Store.set("dosha", dosha);

  // render dosha result
  const dd = dosha.dominant_dosha;
  const icons = {vata:"🌬️",pitta:"🔥",kapha:"🌊"};
  const colors = {vata:"#9C27B0",pitta:"#FF5722",kapha:"#2196F3"};
  document.getElementById("dosha-result-content").innerHTML = `
    <div style="text-align:center;padding:1rem 0">
      <div style="font-size:3.5rem;margin-bottom:0.5rem">${icons[dd]||"🌿"}</div>
      <h2 style="font-family:var(--font-display);font-size:1.9rem;font-weight:800;color:${colors[dd]||"var(--green)"}">
        ${dd.charAt(0).toUpperCase()+dd.slice(1)} Dominant
      </h2>
      <p class="text-muted" style="margin:0.5rem 0 1.25rem">${dosha.description||""}</p>
    </div>
    <div class="section-gap">
      ${["vata","pitta","kapha"].map(d=>`
        <div class="dosha-bar-wrap">
          <div class="dosha-bar-label">
            <span>${icons[d]} ${d.charAt(0).toUpperCase()+d.slice(1)}</span>
            <span>${dosha.percentages?.[d]||0}%</span>
          </div>
          <div class="dosha-bar-track">
            <div class="dosha-bar-fill ${d}" style="width:${dosha.percentages?.[d]||0}%"></div>
          </div>
        </div>
      `).join("")}
    </div>
    ${dosha.recommended_foods?.length ? `
    <div class="grid-2">
      <div>
        <p style="font-weight:600;margin-bottom:0.4rem">✅ Recommended Foods</p>
        ${dosha.recommended_foods.map(f=>`<span class="organ-chip green">🌿 ${f}</span>`).join("")}
      </div>
      <div>
        <p style="font-weight:600;margin-bottom:0.4rem">❌ Avoid</p>
        ${dosha.avoid_foods?.map(f=>`<span class="organ-chip red">⚠️ ${f}</span>`).join("")}
      </div>
    </div>` : ""}
    ${dosha.lifestyle ? `<p class="text-muted mt-2"><strong>Lifestyle tip:</strong> ${dosha.lifestyle}</p>` : ""}
  `;

  // health score card
  const user = Store.get("user") || {};
  let hs = user.health_score_data;
  if (!hs) hs = { score: 72, grade: "Good", risks: [], recommendations: [] };
  const sc = hs.score;
  const scoreColor = sc >= 80 ? "var(--green)" : sc >= 50 ? "var(--yellow)" : "var(--red)";
  const circ = 2 * Math.PI * 54;
  const offset = circ - (sc / 100) * circ;
  document.getElementById("health-result-content").innerHTML = `
    <div style="display:flex;gap:1.5rem;align-items:center;flex-wrap:wrap">
      <div class="score-ring">
        <svg class="ring-svg" width="130" height="130" viewBox="0 0 130 130">
          <circle class="ring-track" cx="65" cy="65" r="54"/>
          <circle class="ring-fill" cx="65" cy="65" r="54"
            stroke="${scoreColor}"
            stroke-dasharray="${circ}"
            stroke-dashoffset="${offset}"/>
        </svg>
        <div class="ring-label" style="color:${scoreColor}">${sc}</div>
        <div class="ring-sublabel">${hs.grade}</div>
      </div>
      <div style="flex:1">
        ${hs.risks?.length ? `<p style="font-weight:600;margin-bottom:0.5rem">⚠️ Risk Factors</p>
          ${hs.risks.map(r=>`<div class="organ-chip ${r.level==="high"?"red":r.level==="moderate"?"yellow":"green"}">${r.label}</div>`).join("")}` : ""}
        ${hs.recommendations?.length ? `<p style="font-weight:600;margin:0.75rem 0 0.4rem">💡 Recommendations</p>
          <ul style="list-style:none;padding:0">
            ${hs.recommendations.slice(0,4).map(r=>`<li style="font-size:0.87rem;color:var(--text-2);margin-bottom:0.25rem">→ ${r}</li>`).join("")}
          </ul>` : ""}
      </div>
    </div>
  `;

  document.getElementById("step2").style.display = "none";
  document.getElementById("step3").style.display = "block";
  setStepIndicator(3);
  toast("Profile complete! 🎉", "success");
}

function setStepIndicator(step) {
  for (let i = 1; i <= 3; i++) {
    const ind = document.getElementById(`step${i}-ind`);
    const dot = ind.querySelector("div");
    if (i <= step) {
      ind.style.color = "var(--green)";
      dot.style.background = "var(--green)";
      dot.style.color = "#fff";
    }
  }
}