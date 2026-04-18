// dashboard.js

const user = Store.get("user") || {};
const dosha = Store.get("dosha") || {};
const hs = user.health_score_data || {};

// Top metrics
const score = hs.score || 0;
const grade = hs.grade || "N/A";
const bmi = user.bmi || 0;
const bmiCat = user.bmi_category || "";
const dom = dosha.dominant_dosha || "—";
const steps = user.steps_per_day || 0;

document.getElementById("m-score").textContent = score || "—";
document.getElementById("m-grade").textContent = grade;
document.getElementById("m-bmi").textContent = bmi || "—";
document.getElementById("m-bmi-cat").textContent = bmiCat;
document.getElementById("m-dosha").textContent = dom ? dom.charAt(0).toUpperCase()+dom.slice(1) : "—";
document.getElementById("m-steps").textContent = steps ? steps.toLocaleString() : "—";

// Score ring
const circ = 2 * Math.PI * 58;
const offset = circ - (score / 100) * circ;
const scoreColor = score >= 80 ? "var(--green)" : score >= 50 ? "var(--yellow)" : "var(--red)";
const ring = document.getElementById("score-ring-fill");
ring.style.strokeDasharray = circ;
ring.style.strokeDashoffset = offset;
ring.style.stroke = scoreColor;
document.getElementById("score-num").textContent = score || "—";
document.getElementById("score-num").style.color = scoreColor;
document.getElementById("score-grade").textContent = grade;

// Score breakdown bars
const bd = hs.breakdown || {};
document.getElementById("score-breakdown").innerHTML = Object.entries({
  "BMI": Math.round(bd.bmi_score || 0),
  "Activity": Math.round(bd.activity_score || 0),
  "Sleep": Math.round(bd.sleep_score || 0),
  "Stress": Math.round(bd.stress_score || 0)
}).map(([label, val]) => `
  <div class="dosha-bar-wrap">
    <div class="dosha-bar-label"><span>${label}</span><span>${val}/25</span></div>
    <div class="dosha-bar-track">
      <div class="dosha-bar-fill vata" style="width:${val/25*100}%;background:var(--green)"></div>
    </div>
  </div>
`).join("");

// Dosha bars
const icons = {vata:"🌬️",pitta:"🔥",kapha:"🌊"};
const pct = dosha.percentages || {vata:33,pitta:33,kapha:34};
document.getElementById("dosha-bars").innerHTML = ["vata","pitta","kapha"].map(d=>`
  <div class="dosha-bar-wrap">
    <div class="dosha-bar-label">
      <span>${icons[d]} ${d.charAt(0).toUpperCase()+d.slice(1)}</span>
      <span>${pct[d]||0}%</span>
    </div>
    <div class="dosha-bar-track">
      <div class="dosha-bar-fill ${d}" style="width:${pct[d]||0}%"></div>
    </div>
  </div>
`).join("");
document.getElementById("dosha-tips").textContent = dosha.lifestyle || "Complete your profile to see personalised lifestyle tips.";

// Risks
const risks = hs.risks || [];
document.getElementById("risk-list").innerHTML = risks.length
  ? risks.map(r=>`
      <div style="display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0;border-bottom:1px solid var(--border)">
        <span class="badge badge-${r.level==="high"?"red":r.level==="moderate"?"yellow":"green"}">
          ${r.level}
        </span>
        <span style="font-size:0.9rem">${r.label}</span>
      </div>`).join("")
  : `<p class="text-muted">No significant risk factors detected 🎉</p>`;

// Recommendations
const recs = hs.recommendations || [];
document.getElementById("rec-list").innerHTML = recs.length
  ? recs.map(r=>`
      <div style="padding:0.5rem 0;border-bottom:1px solid var(--border);font-size:0.9rem">
        → ${r}
      </div>`).join("")
  : `<p class="text-muted">Complete your profile to get recommendations.</p>`;

// Vitals chart using native Canvas (no lib dependency)
(function drawVitals() {
  const canvas = document.getElementById("vitalsChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth || 700;
  canvas.height = 160;

  const labels = ["Sleep", "Steps", "Exercise", "Stress (inv)", "BMI (inv)"];
  const rawVals = [
    Math.min(100, (user.sleep_hours || 0) / 9 * 100),
    Math.min(100, (user.steps_per_day || 0) / 10000 * 100),
    Math.min(100, (user.exercise_hours_week || 0) / 7 * 100),
    Math.max(0, 100 - (user.stress_level || 5) * 10),
    Math.max(0, 100 - Math.abs((user.bmi || 22) - 22) * 5)
  ];

  const W = canvas.width, H = canvas.height;
  const barW = W / labels.length * 0.5;
  const gap = W / labels.length;
  const colors = ["#4CAF50","#2196F3","#9C27B0","#FF5722","#FFC107"];

  ctx.clearRect(0,0,W,H);
  rawVals.forEach((val,i) => {
    const x = gap * i + gap * 0.25;
    const barH = (val / 100) * (H - 40);
    const y = H - 30 - barH;
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, 5);
    ctx.fill();
    ctx.fillStyle = "#333";
    ctx.font = "11px DM Sans, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(labels[i], x + barW/2, H - 10);
    ctx.fillStyle = colors[i];
    ctx.font = "bold 12px DM Sans, sans-serif";
    ctx.fillText(Math.round(val), x + barW/2, y - 5);
  });
})();

if (!user.age) {
  document.querySelector(".container").insertAdjacentHTML("afterbegin",
    `<div class="card bg-yellow section-gap">
      ⚠️ No profile found. <a href="input.html" style="color:var(--green);font-weight:600">Complete your profile first →</a>
    </div>`);
}