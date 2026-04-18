// chat.js — AI Health Assistant
let chatHistory = [];
let isTyping = false;

function buildSystemPrompt() {
  const user = Store.get("user") || {};
  const dosha = Store.get("dosha") || {};
  return `You are a warm, knowledgeable AI Health Assistant for a Digital Twin Health application. 
You specialize in Ayurvedic nutrition, modern dietetics, and preventive health.

The user's profile:
- Age: ${user.age || "unknown"}, Gender: ${user.gender || "unknown"}
- BMI: ${user.bmi || "unknown"} (${user.bmi_category || ""})
- Dosha: ${dosha.dominant_dosha || "unknown"}
- Diabetes: ${user.diabetes ? "Yes" : "No"}
- Hypertension: ${user.hypertension ? "Yes" : "No"}
- Sleep: ${user.sleep_hours || "?"} hrs/night
- Stress level: ${user.stress_level || "?"}/10
- Steps/day: ${user.steps_per_day || "?"}

Your guidelines:
- Give practical, personalised advice based on their profile
- Reference Ayurvedic principles where relevant (Vata, Pitta, Kapha)
- Always mention if something needs a doctor's advice
- Keep responses concise (3-6 sentences) and friendly
- Use bullet points for lists
- Do not provide medical diagnoses`;
}

function addMessage(text, role) {
  const win = document.getElementById("chat-window");
  const div = document.createElement("div");
  div.className = `chat-bubble ${role}`;
  div.textContent = text;
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
  return div;
}

function addTypingIndicator() {
  const win = document.getElementById("chat-window");
  const div = document.createElement("div");
  div.className = "chat-bubble bot";
  div.id = "typing-indicator";
  div.innerHTML = "<span class='spinner'></span> Thinking…";
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.gap = "0.5rem";
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById("typing-indicator");
  if (el) el.remove();
}

async function sendMessage() {
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if (!text || isTyping) return;
  input.value = "";
  sendPrompt(text);
}

async function sendPrompt(text) {
  isTyping = true;
  document.getElementById("send-btn").disabled = true;
  document.getElementById("chat-input").value = "";

  addMessage(text, "user");
  chatHistory.push({ role: "user", content: text });

  addTypingIndicator();

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: buildSystemPrompt(),
        messages: chatHistory
      })
    });

    removeTypingIndicator();

    if (!response.ok) {
      throw new Error("API error " + response.status);
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "I'm having trouble responding right now. Please try again.";
    addMessage(reply, "bot");
    chatHistory.push({ role: "assistant", content: reply });

  } catch(e) {
    removeTypingIndicator();
    // Fallback to rule-based responses if API unavailable
    const fallback = getRuleBasedResponse(text);
    addMessage(fallback, "bot");
    chatHistory.push({ role: "assistant", content: fallback });
  }

  isTyping = false;
  document.getElementById("send-btn").disabled = false;
}

function getRuleBasedResponse(query) {
  const q = query.toLowerCase();
  const user = Store.get("user") || {};
  const dosha = Store.get("dosha") || {};
  const d = dosha.dominant_dosha || "vata";

  if (q.includes("vata") || (q.includes("dosha") && d === "vata")) {
    return "For Vata dosha, favour warm, moist, and heavy foods like soups, ghee, root vegetables, and warm milk. Avoid raw salads, cold drinks, and dry snacks. Eat at regular times and maintain a daily routine to keep Vata balanced.";
  }
  if (q.includes("pitta")) {
    return "Pitta types do best with cooling, sweet, and astringent foods. Include coconut, cucumber, mint, coriander, and sweet fruits. Avoid spicy, fried, and fermented foods. Stay cool and practice calming activities like swimming.";
  }
  if (q.includes("kapha")) {
    return "Kapha types benefit from light, warm, and stimulating foods. Favour legumes, leafy greens, ginger, honey, and bitter vegetables. Avoid heavy dairy, sweets, and cold foods. Regular vigorous exercise is essential.";
  }
  if (q.includes("diabetes") || q.includes("sugar") || q.includes("blood glucose")) {
    return "For diabetes management: choose low GI foods (oats, lentils, leafy greens), avoid refined carbs and sugary drinks, eat smaller frequent meals, and include bitter gourd (karela) and fenugreek seeds which have blood-sugar lowering properties. Always consult your doctor for medication adjustments.";
  }
  if (q.includes("blood pressure") || q.includes("hypertension") || q.includes("bp")) {
    return "For high blood pressure: limit sodium to under 1500mg/day, increase potassium via bananas, spinach, and sweet potatoes, avoid processed and pickled foods, reduce caffeine, and practice daily relaxation. Regular moderate exercise like walking is highly beneficial.";
  }
  if (q.includes("sleep")) {
    return "For better sleep: avoid heavy meals 2-3 hours before bedtime, try warm turmeric milk (golden milk), keep a consistent sleep schedule, and reduce screen time before bed. Ashwagandha and Brahmi are Ayurvedic herbs known to support restful sleep.";
  }
  if (q.includes("stress")) {
    return "To manage stress naturally: practice Pranayama (breathing exercises) for 10 minutes daily, try Ashwagandha supplements, eat adaptogenic foods like tulsi and amla, reduce caffeine, and ensure adequate sleep. Regular yoga has strong evidence for stress reduction.";
  }
  if (q.includes("weight") || q.includes("bmi")) {
    return `Your current BMI is ${user.bmi || "unknown"}. Focus on whole, unprocessed foods, eat mindfully without distractions, practice portion control, and include 30 minutes of daily movement. Avoid crash diets — sustainable changes work best.`;
  }
  return `That's a great health question! Based on your ${d} dosha profile, I'd recommend focusing on foods that balance your constitution. For the most accurate personalised advice, please ensure your profile is complete and consider consulting an Ayurvedic practitioner or registered dietitian.`;
}

function clearChat() {
  chatHistory = [];
  const win = document.getElementById("chat-window");
  win.innerHTML = `<div class="chat-bubble bot">Chat cleared! How can I help you with your health today? 🌿</div>`;
}