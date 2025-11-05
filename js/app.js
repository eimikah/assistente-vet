const links = document.querySelectorAll("[data-screen]");
const screens = document.querySelectorAll(".screen");

function go(screenId) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
  links.forEach(l => l.classList.remove("active"));
  [...links].find(l => l.dataset.screen === screenId)?.classList.add("active");
}
links.forEach(l => l.addEventListener("click", () => go(l.dataset.screen)));
document.querySelectorAll("[data-screen='dashboard']").forEach(btn =>
  btn.addEventListener("click", () => go("dashboard"))
);

const toggle = document.getElementById("themeToggle");
if (localStorage.theme === "dark") {
  document.body.classList.add("dark");
  toggle.textContent = "☀️";
}
toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const mode = document.body.classList.contains("dark") ? "dark" : "light";
  localStorage.theme = mode;
  toggle.textContent = mode === "dark" ? "☀️" : "🌙";
});

const chartInterval = setInterval(() => {
  const canvas = document.getElementById("weightChart");
  if (!canvas) return;
  clearInterval(chartInterval);

  new Chart(canvas, {
    type: "line",
    data: {
      labels: ["Jan", "Fev", "Mar", "Abr", "Mai"],
      datasets: [{
        label: "Peso (kg)",
        data: [3.9, 4.0, 4.1, 4.15, 4.2],
        borderWidth: 3,
        tension: 0.4,
        borderColor: "#007aff"
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: false } }
    }
  });
}, 200);

const chat = document.getElementById("chat");
const input = document.getElementById("inputMsg");
const sendBtn = document.getElementById("sendBtn");

let chatEncerrado = false;

function addMessage(text, type) {
  const msg = document.createElement("div");
  msg.className = `message ${type}`;
  msg.textContent = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
  return msg;
}

function clearQuickReplies() {
  const qr = chat.querySelector(".quick-replies");
  if (qr) qr.remove();
}

function addQuickReplies(options) {
  clearQuickReplies();
  const box = document.createElement("div");
  box.className = "quick-replies";
  options.forEach(opt => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = opt.label;
    b.dataset.intent = opt.intent;
    b.className = "btn-primary";
    b.style.marginRight = "8px";
    b.style.marginTop = "8px";
    box.appendChild(b);
  });
  chat.appendChild(box);
  chat.scrollTop = chat.scrollHeight;
}

const INTENTS = {
  vacinas: "Vacinas devem estar em dia. Você sabe qual foi a última aplicada? 💉",
  vomito: "Se o vômito persistir ou houver sangue, procure um veterinário. Mantenha hidratação 💧",
  coceira: "Pode ser alergia, pulgas ou dermatite. Observe pele e pelagem e, se possível, registre quando começou 🐾",
  alimentacao: "Alimentação: mantenha ração adequada para idade/peso. Evite mudanças bruscas; troque aos poucos 🍽️",
  peso: "Peso ideal: acompanhe no gráfico. Varia por raça/idade; se houver ganho/perda rápida, investigue 🩺",
  consulta: "Para consulta: leve histórico, datas de vacinas e comportamento recente. Hidrate e mantenha em jejum se o vet orientar 📅"
};
function isGreeting(text) {
  const t = text.trim().toLowerCase();
  return /(oi|olá|ola|bom dia|boa tarde|boa noite|hey|iniciar|começar|comecar)/.test(t);
}

function listarTopicos() {
  addQuickReplies([
    { label: "Vacinas", intent: "vacinas" },
    { label: "Vômito", intent: "vomito" },
    { label: "Coceira", intent: "coceira" },
    { label: "Alimentação", intent: "alimentacao" },
    { label: "Peso ideal", intent: "peso" },
    { label: "Consulta / Agendamento", intent: "consulta" },
    { label: "Encerrar chat", intent: "encerrar" }
  ]);
}

function iniciarChat() {
  chatEncerrado = false;
  addMessage("Olá! Eu sou o Tom, o Assistente Vet. 🩺💙 e aqui estão os tópicos disponíveis:", "bot");
  listarTopicos();
}

function encerrarChat() {
  chatEncerrado = true;
  addMessage("Chat encerrado. Obrigado por conversar comigo! 💙🐾", "bot");
  clearQuickReplies();
}

function reply(userMsg) {
  const t = userMsg.toLowerCase();
  if (chatEncerrado && isGreeting(t)) {
    iniciarChat();
    return;
  } else if (chatEncerrado && !isGreeting(t)) {
    iniciarChat();
    return;
  }
  if (isGreeting(t)) {
    iniciarChat();
    return;
  }

  let intent = null;
  if (t.includes("vacina")) intent = "vacinas";
  if (t.includes("vomi")) intent = "vomito";
  if (t.includes("coça") || t.includes("coceira")) intent = "coceira";
  if (t.includes("alimenta")) intent = "alimentacao";
  if (t.includes("peso")) intent = "peso";
  if (t.includes("consulta") || t.includes("agendar")) intent = "consulta";
  if (t.includes("voltar")) {
    listarTopicos();
    return;
  }
  if (t.includes("encerrar")) {
    encerrarChat();
    return;
  }

  const resposta = intent ? INTENTS[intent] : "Desculpe, não entendi bem. Poderia reformular? 😊";
  addMessage(resposta, "bot");
  addQuickReplies([
    { label: "⬅️ Voltar aos tópicos", intent: "voltar" },
    { label: "Encerrar chat", intent: "encerrar" }
  ]);
}

sendBtn.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return;
  clearQuickReplies();
  addMessage(text, "user");
  input.value = "";
  setTimeout(() => reply(text), 400);
});

input.addEventListener("keypress", e => e.key === "Enter" && sendBtn.click());

chat.addEventListener("click", e => {
  const btn = e.target.closest("button[data-intent]");
  if (!btn) return;
  const intent = btn.dataset.intent;
  clearQuickReplies();
  addMessage(btn.textContent, "user");
  if (intent === "voltar") {
    setTimeout(listarTopicos, 400);
    return;
  }
  if (intent === "encerrar") {
    setTimeout(encerrarChat, 400);
    return;
  }

  const resposta = INTENTS[intent] || "Certo!";
  setTimeout(() => {
    addMessage(resposta, "bot");
    addQuickReplies([
      { label: "⬅️ Voltar aos tópicos", intent: "voltar" },
      { label: "Encerrar chat", intent: "encerrar" }
    ]);
  }, 400);
});
