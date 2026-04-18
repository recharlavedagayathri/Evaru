// api.js — Centralised API helpers
const BASE = "http://127.0.0.1:8000";

async function apiPost(path, body) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function apiGet(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = BASE + path + (qs ? "?" + qs : "");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ---- Toast ----
function toast(msg, type = "success") {
  let el = document.getElementById("_toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "_toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = `toast ${type} show`;
  setTimeout(() => el.classList.remove("show"), 3200);
}

// ---- Loading overlay ----
function showLoading(msg = "Processing…") {
  let ov = document.getElementById("_loading");
  if (!ov) {
    ov = document.createElement("div");
    ov.id = "_loading";
    ov.className = "loading-overlay";
    ov.innerHTML = `<div class="spinner"></div><span id="_loadMsg">${msg}</span>`;
    document.body.appendChild(ov);
  }
  document.getElementById("_loadMsg").textContent = msg;
  ov.classList.add("show");
}
function hideLoading() {
  const ov = document.getElementById("_loading");
  if (ov) ov.classList.remove("show");
}

// ---- localStorage helpers ----
const Store = {
  set: (k, v) => localStorage.setItem("dt_" + k, JSON.stringify(v)),
  get: (k, def = null) => {
    try { return JSON.parse(localStorage.getItem("dt_" + k)) ?? def; } catch { return def; }
  },
  clear: () => Object.keys(localStorage).filter(k => k.startsWith("dt_")).forEach(k => localStorage.removeItem(k))
};