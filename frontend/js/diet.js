// diet.js
let planData = null;

window.addEventListener("DOMContentLoaded", () => {
  const user = Store.get("user") || {};
  const dosha = Store.get("dosha") || {};
  if (dosha.dominant_dosha) document.getElementById("plan-dosha").value = dosha.dominant_dosha;
  if (user.bmi) document.getElementById("plan-bmi").value = user.bmi;
  if (user.diabetes) document.getElementById("plan-diabetes").value = "true";
  if (user.hypertension) document.getElementById("plan-bp").value = "true";
  generatePlan();
});

async function generatePlan() {
  const dosha = document.getElementById("plan-dosha").value;
  const bmi = parseFloat(document.getElementById("plan-bmi").value) || 22;
  const diabetes = document.getElementById("plan-diabetes").value === "true";
  const hypertension = document.getElementById("plan-bp").value === "true";

  showLoading("Generating your 7-day plan…");
  try {
    planData = await apiPost("/diet-plan", { dosha, bmi, diabetes, hypertension, age: 30, gender: "male" });
    hideLoading();
    renderPlan(planData);
  } catch(e) {
    hideLoading();
    toast("Backend not reachable — showing sample plan", "error");
    renderPlan(samplePlan(dosha, bmi));
  }
}

function renderPlan(plan) {
  const doshaIcon = { vata:"🌬️", pitta:"🔥", kapha:"🌊" };
  document.getElementById("s-dosha").textContent = (doshaIcon[plan.dosha]||"") + " " + (plan.dosha||"").charAt(0).toUpperCase() + (plan.dosha||"").slice(1);
  document.getElementById("s-bmi").textContent = plan.bmi_category || "—";
  document.getElementById("s-water").textContent = plan.water_intake_liters || "2.0";
  document.getElementById("s-cal").textContent = plan.calorie_note || "Balanced";

  document.getElementById("plan-summary").style.display = "grid";

  // Guidelines
  const gl = plan.guidelines || [];
  document.getElementById("guidelines-content").innerHTML = gl.length
    ? `<div style="display:flex;flex-direction:column;gap:0.5rem">${gl.map(g=>`
        <div style="display:flex;align-items:flex-start;gap:0.6rem;font-size:0.9rem;padding:0.4rem 0;border-bottom:1px solid var(--border)">
          <span style="color:var(--green);font-weight:700">→</span>${g}
        </div>`).join("")}</div>`
    : "<p class='text-muted'>No specific guidelines.</p>";
  document.getElementById("guidelines-card").style.display = "block";

  // Table
  const tbody = document.getElementById("plan-tbody");
  const days = plan.weekly_plan || [];
  tbody.innerHTML = days.map(d => `
    <tr>
      <td><strong>${d.day}</strong></td>
      <td>${d.meals?.breakfast || "—"}
        ${d.meals?.note ? `<br/><span style="font-size:0.75rem;color:var(--text-2)">${d.meals.note}</span>` : ""}</td>
      <td>${d.meals?.lunch || "—"}</td>
      <td>${d.meals?.dinner || "—"}</td>
      <td>${d.meals?.snacks || "—"}</td>
    </tr>`).join("");
  document.getElementById("plan-table-card").style.display = "block";
  document.getElementById("export-row").style.display = "flex";
}

function exportCSV() {
  if (!planData?.weekly_plan) return;
  const rows = [["Day","Breakfast","Lunch","Dinner","Snack"]];
  planData.weekly_plan.forEach(d => {
    rows.push([d.day, d.meals.breakfast, d.meals.lunch, d.meals.dinner, d.meals.snacks]);
  });
  const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "diet_plan.csv";
  a.click();
}

function samplePlan(dosha, bmi) {
  return {
    dosha, bmi, bmi_category: bmi < 25 ? "Normal" : "Overweight",
    water_intake_liters: 2.0, calorie_note: "Balanced intake",
    guidelines: ["Eat at regular times", "Avoid processed foods", "Drink warm water"],
    weekly_plan: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((day,i) => ({
      day,
      meals: {
        breakfast: ["Oatmeal with ghee","Idli sambar","Poha","Eggs toast","Upma","Banana smoothie","Dalia"][i],
        lunch: ["Dal rice","Rajma rice","Khichdi","Chicken curry rice","Vegetable biryani","Palak paneer","Lentil soup"][i],
        dinner: ["Soup bread","Dal roti","Quinoa bowl","Chicken stew","Moong dal","Sabzi roti","Vegetable soup"][i],
        snacks: ["Almonds","Banana","Coconut water","Makhana","Apple","Nuts","Ginger tea"][i]
      }
    }))
  };
}