// analyzer.js

let searchTimeout;
let currentFood = null;



// Pre-fill dosha from stored profile
window.addEventListener("DOMContentLoaded", () => {
  const dosha = Store.get("dosha");
  const user = Store.get("user");
  if (dosha?.dominant_dosha) {
    document.getElementById("sel-dosha").value = dosha.dominant_dosha;
  }
  if (user) {
    document.getElementById("cb-diabetes").checked = !!user.diabetes;
    document.getElementById("cb-bp").checked = !!user.hypertension;
  }
});

function onFoodInput(val) {
  clearTimeout(searchTimeout);
  if (val.length < 2) { hideSuggestions(); return; }
  searchTimeout = setTimeout(() => fetchSuggestions(val), 280);
}

async function fetchSuggestions(q) {
  try {
    const data = await apiGet("/food-search", { q });
    showSuggestions(data.results || []);
  } catch(e) { hideSuggestions(); }
}

function showSuggestions(items) {
  const box = document.getElementById("suggestions");
  if (!items.length) { box.style.display = "none"; return; }
  box.innerHTML = items.map(f => `
    <div onclick="selectFood('${f.replace(/'/g,"\\'")}'))"
      style="padding:0.6rem 0.9rem;cursor:pointer;font-size:0.9rem;border-bottom:1px solid var(--border)"
      onmouseover="this.style.background='var(--green-l)'"
      onmouseout="this.style.background=''">${f}</div>
  `).join("");
  box.style.display = "block";
}

function hideSuggestions() {
  document.getElementById("suggestions").style.display = "none";
}

function selectFood(name) {
  document.getElementById("food-input").value = name;
  hideSuggestions();
  analyzeFood();
}

document.addEventListener("click", e => {
  if (!e.target.closest("#food-input") && !e.target.closest("#suggestions")) hideSuggestions();
});

async function analyzeFood() {
  const food = document.getElementById("food-input").value.trim();
  if (!food) { toast("Please enter a food name", "error"); return; }

  const dosha = document.getElementById("sel-dosha").value;
  const diabetes = document.getElementById("cb-diabetes").checked;
  const hypertension = document.getElementById("cb-bp").checked;

  showLoading("Analyzing food…");
  try {
    const result = await apiPost("/food-analysis", { food_name: food, dosha, diabetes, hypertension });
    hideLoading();
    currentFood = result;
    renderResult(result);
    // Update 3D twin
    if (typeof updateTwinColor === "function") {
      updateTwinColor(result.color, result.affected_organs || []);
    }
    document.getElementById("sim-card").style.display = "block";
    Store.set("last_analysis", result);
  } catch(e) {
    hideLoading();
    toast("Could not reach backend — check if server is running", "error");
  }
}

function renderResult(r) {
  const colClass = { green: "bg-green", yellow: "bg-yellow", red: "bg-red" }[r.color] || "bg-green";
  const colBadge = { green: "badge-green", yellow: "badge-yellow", red: "badge-red" }[r.color] || "badge-green";
  const icon = { green: "✅", yellow: "⚠️", red: "🚨" }[r.color] || "✅";

  document.getElementById("result-card").style.display = "block";
  document.getElementById("result-content").innerHTML = `
    <div class="card ${colClass}" style="margin:-1.75rem -1.75rem 1.25rem;padding:1.25rem 1.75rem;border-radius:var(--radius) var(--radius) 0 0">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-family:var(--font-display);font-size:1.4rem;font-weight:800">${icon} ${r.food_name}</div>
          <div class="text-muted">${r.category || ""}</div>
        </div>
        <span class="badge ${colBadge}" style="font-size:1rem;padding:0.4rem 1rem">${r.status}</span>
      </div>
    </div>

    <!-- Nutrition -->
    <div class="card-title">🧪 Nutrition Facts</div>
    <div class="nut-grid">
      ${[
        ["Calories", r.nutrition?.calories || 0, "kcal"],
        ["Protein", r.nutrition?.protein || 0, "g"],
        ["Carbs", r.nutrition?.carbs || 0, "g"],
        ["Fat", r.nutrition?.fat || 0, "g"],
        ["Sugar", r.nutrition?.sugar || 0, "g"],
        ["Fiber", r.nutrition?.fiber || 0, "g"],
        ["Sodium", r.nutrition?.sodium || 0, "mg"],
        ["GI", r.glycemic_index || 0, ""]
      ].map(([l, v, u]) => `
        <div class="nut-cell">
          <div class="val">${typeof v === "number" ? v.toFixed(1) : v}</div>
          <div class="lbl">${l} ${u}</div>
        </div>`).join("")}
    </div>

    <hr class="divider"/>

    <!-- Ayurveda -->
    <div class="card-title">🌿 Ayurvedic Profile</div>
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.75rem">
      ${r.ayurveda?.rasa ? `<span class="badge badge-green">Rasa: ${r.ayurveda.rasa}</span>` : ""}
      ${r.ayurveda?.guna ? `<span class="badge badge-blue">Guna: ${r.ayurveda.guna}</span>` : ""}
      ${r.ayurveda?.virya ? `<span class="badge badge-yellow">Virya: ${r.ayurveda.virya}</span>` : ""}
    </div>

    <!-- Reasons -->
    <div class="card-title">📋 Analysis</div>
    ${r.reasons?.map(reason => `
      <div style="display:flex;align-items:flex-start;gap:0.5rem;padding:0.4rem 0;border-bottom:1px solid var(--border);font-size:0.9rem">
        <span>→</span> ${reason}
      </div>`).join("") || ""}

    <!-- Affected organs -->
    ${r.affected_organs?.length ? `
      <hr class="divider"/>
      <div class="card-title">🫀 Affected Organs</div>
      <div>${r.affected_organs.map(o => `
        <span class="organ-chip ${ r.color === "red" ? "red" : r.color === "yellow" ? "yellow" : "green"}">
          🔴 ${o}
        </span>`).join("")}
      </div>` : ""}

    <!-- Tags -->
    ${r.health_tags && r.health_tags !== "nan" ? `
      <hr class="divider"/>
      <div class="text-muted" style="font-size:0.82rem">🏷️ ${r.health_tags}</div>` : ""}

    <!-- Properties -->
    <hr class="divider"/>
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
      ${r.is_fried ? `<span class="badge badge-red">🍳 Fried</span>` : ""}
      ${r.is_processed ? `<span class="badge badge-yellow">📦 Processed</span>` : ""}
      ${r.is_spicy ? `<span class="badge badge-red">🌶️ Spicy</span>` : ""}
      ${!r.is_fried && !r.is_processed ? `<span class="badge badge-green">🌱 Whole Food</span>` : ""}
    </div>
  `;
}

async function runSimulation() {
  if (!currentFood) { toast("Analyze a food first", "error"); return; }
  const freq = document.getElementById("sel-freq").value;
  const dosha = document.getElementById("sel-dosha").value;
  const diabetes = document.getElementById("cb-diabetes").checked;
  const hypertension = document.getElementById("cb-bp").checked;

  showLoading("Running 12-week simulation…");
  try {
    const data = await apiPost("/simulation", {
      food_name: currentFood.food_name,
      dosha, diabetes, hypertension,
      consumption_frequency: freq
    });
    hideLoading();
    renderSimulation(data.simulation);
  } catch(e) {
    hideLoading();
    toast("Simulation failed — is backend running?", "error");
  }
}

function renderSimulation(sim) {
  if (!sim) return;
  const dotClass = s => s === "normal" ? "green" : s === "moderate" ? "yellow" : s === "warning" ? "yellow" : "red";
  const dotIcon = s => s === "normal" ? "✓" : s === "moderate" ? "~" : "!";

  document.getElementById("sim-result").innerHTML = `
    <p style="font-size:0.85rem;color:var(--text-2);margin-bottom:1rem">${sim.summary || ""}</p>
    <div class="timeline">
      ${["week1","week4","week12"].map(w => {
        const wk = sim.timeline?.[w] || {};
        return `
          <div class="timeline-item">
            <div class="timeline-dot ${dotClass(wk.status)}">${dotIcon(wk.status)}</div>
            <div class="timeline-week">${w.replace("week","Week ")}</div>
            <div class="timeline-msg">${wk.message || ""}</div>
            <div style="font-size:0.75rem;color:var(--text-2);margin-top:0.2rem">Risk: ${wk.risk || 0}%</div>
          </div>`;
      }).join("")}
    </div>

    ${sim.biomarker_projection ? `
      <hr class="divider"/>
      <p style="font-weight:600;margin-bottom:0.6rem;font-size:0.9rem">📊 Projected Biomarkers</p>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:0.82rem">
          <thead>
            <tr style="background:var(--bg)">
              <th style="padding:0.4rem 0.6rem;text-align:left">Marker</th>
              <th style="padding:0.4rem 0.6rem">Baseline</th>
              <th style="padding:0.4rem 0.6rem">Week 4</th>
              <th style="padding:0.4rem 0.6rem">Week 12</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(sim.biomarker_projection).map(([k,v])=>`
              <tr style="border-bottom:1px solid var(--border)">
                <td style="padding:0.4rem 0.6rem;font-weight:500">${k.replace(/_/g," ")}</td>
                <td style="padding:0.4rem 0.6rem;text-align:center">${Number(v.week1||0).toFixed(1)}</td>
                <td style="padding:0.4rem 0.6rem;text-align:center">${Number(v.week4||0).toFixed(1)}</td>
                <td style="padding:0.4rem 0.6rem;text-align:center;font-weight:600;
                  color:${Number(v.week12||0) > Number(v.week1||0)*1.1 ? "var(--red)" : "var(--green)"}">
                  ${Number(v.week12||0).toFixed(1)}
                </td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>` : ""}
  `;
}