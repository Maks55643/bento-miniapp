/* ===== TELEGRAM ===== */
const API_BASE = "https://bentoapp-production.up.railway.app";
const tg = Telegram.WebApp;
tg.ready();
tg.expand();
tg.disableVerticalSwipes();
tg.enableClosingConfirmation();
tg.setHeaderColor("#0e0f14");
tg.setBackgroundColor("#0e0f14");

/* ===== DOM ===== */
const loading = document.getElementById("loading");
const app = document.getElementById("app");

/* ===== AUTO CLOSE ===== */
let idleTimer = null;
const IDLE_LIMIT = 2 * 60 * 1000; // 2 минуты

function resetIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer);

  idleTimer = setTimeout(() => {
    console.log("⏳ idle timeout → closing app");
    tg.close();
  }, IDLE_LIMIT);
}

["click", "touchstart", "keydown"].forEach(evt => {
  document.addEventListener(evt, resetIdleTimer, true);
});

let banInterval = null;

function startBanWatcher(tg_id) {
  banInterval = setInterval(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/status/${tg_id}`);

      if (res.status === 403) {
        const data = await res.json();
        kickUser(data);
      }
    } catch (e) {
      console.error("Ban check error", e);
    }
  }, 1000);
}

/* ===== SUPABASE ===== */
let sb = null;

async function initSupabase() {
  try {
    const res = await fetch(`${API_BASE}/config`);
    if (!res.ok) throw new Error("config fetch failed");

    const cfg = await res.json();

    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
      throw new Error("Supabase config empty");
    }

    sb = supabase.createClient(
      cfg.supabaseUrl,
      cfg.supabaseAnonKey
    );

    console.log("Supabase initialized");
  } catch (e) {
    console.error("Supabase init error:", e);
    sb = null;
  }
}

/* ===== HASH ===== */
async function hashPin(pin){
  const data = new TextEncoder().encode(pin);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)]
    .map(b => b.toString(16).padStart(2,"0"))
    .join("");
}

/* ===== STATE ===== */
let user = null;
let ROLE = "";
let REQUEST_FILTER = "pending"; // new | approved | rejected
let PIN_HASH = "";
let input = "";
let inputLocked = false;
let error = false;

let denied = false;

let attempts = 0;
let blockedUntil = 0;

const MAX_ATTEMPTS = 3;
const BLOCK_TIME = 5 * 60 * 1000;

/* ===== LOADER ===== */
function showApp(){
  loading.style.display = "none";
  loading.style.pointerEvents = "none";

  app.style.display = "flex";
  app.style.pointerEvents = "auto";
}

function deny(reason = "access"){
  if (denied) return; // ⛔ защита от повторов
  denied = true;

  let text = "⛔ Нет доступа";

  switch(reason){
    case "banned": text = "🚫 Вы заблокированы"; break;
    case "no_role": text = "👤 У вас нет прав доступа"; break;
    case "deleted": text = "🗑 Доступ удалён"; break;
    case "error": text = "⚠️ Ошибка сервера"; break;
  }

  // ⛔ полностью останавливаем app
  app.innerHTML = "";
  app.style.display = "none";
  app.style.pointerEvents = "none";

  loading.style.display = "flex";
  loading.style.pointerEvents = "none";
  loading.innerHTML = `<div class="deny-text">${text}</div>`;

  tg.HapticFeedback.notificationOccurred("error");

  setTimeout(() => {
    tg.close();
  }, 2000);
}

/* ===== START ===== */
async function start() {
  if (!sb) {
    deny("error");
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/auth/telegram`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initData: tg.initData
      })
    });

    if (!res.ok) {
      console.error("AUTH FAILED:", res.status);
      throw new Error("auth failed");
    }

    user = await res.json();

    if (user.error === "BANNED") {
      deny("banned");
      return;
    }

    ROLE = user.role;
    PIN_HASH = user.pin_hash || "";
    blockedUntil = user.blocked_until || 0;

    showApp();
    resetIdleTimer();
    startBanWatcher(user.id);

    // 🔒 CHECK BAN ON RETURN (visibility)
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        fetch(`${API_BASE}/auth/status/${user.id}`)
          .then(res => {
            if (res.status === 403) {
              return res.json().then(kickUser);
            }
          })
          .catch(() => {});
      }
    });

    if (Date.now() < blockedUntil) {
      showBlockedScreen();
      return;
    }

    if (ROLE === "owner") {
      welcome();
    } else {
      drawPin();
    }

  } catch (e) {
    console.error("START ERROR:", e);
    deny("access");
  }
}

function kickUser(data) {
  alert(
    data.reason === "permanent_ban"
      ? "🚫 Вы заблокированы навсегда"
      : "Вы заблокированы"
  );

  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.close();
  }

  window.location.href = "about:blank"; // Отключить от приложения
}

/* ===== PIN UI ===== */
app.style.display = "flex";
app.style.pointerEvents = "auto";

function drawPin(){
  if (ROLE === "owner") return; // ⛔ owner никогда не видит PIN
  if(Date.now() < blockedUntil) return;

  app.innerHTML = `
    <div class="card">
      <div class="avatar" style="background-image:url('${user.photo_url||""}')"></div>
      <div class="user-name">${user.first_name}</div>
      <div class="user-role">${ROLE}</div>

      <div class="dots">
        ${[0,1,2,3].map(i =>
          `<div class="dot ${input[i]?'fill':''} ${error?'error':''}"></div>`
        ).join("")}
      </div>

      <div class="keypad">
        ${[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map(k=>{
          return k === ""
            ? `<div class="key empty"></div>`
            : `<div class="key" data-key="${k}">${k}</div>`;
        }).join("")}
      </div>
    </div>
  `;
}

/* ===== KEYPAD ===== */
app.addEventListener("click", e=>{
  const key = e.target.closest(".key");
  if(!key || key.classList.contains("empty")) return;
  press(key.dataset.key);
});

function press(k){
  if (ROLE === "owner") return; // ⛔ owner никогда не видит PIN
  if(inputLocked || Date.now() < blockedUntil) return;
  tg.HapticFeedback.impactOccurred("light");

  if(k === "⌫") input = input.slice(0,-1);
  else if(input.length < 4) input += k;

  error = false;
  drawPin();

  if(input.length === 4) check();
 }

/* ===== CHECK ===== */
async function check(){
  if (!sb) {
  deny("error");
  return;
 }
  
  if (ROLE === "owner") return;

  inputLocked = true;

  const ok = PIN_HASH && await hashPin(input) === PIN_HASH;

  if (ok) {
    tg.HapticFeedback.notificationOccurred("success");
    input = "";
    attempts = 0;
    inputLocked = false;
    welcome();
    return;
  }

  attempts++;
  tg.HapticFeedback.notificationOccurred("error");

  if (attempts >= MAX_ATTEMPTS) {
    blockedUntil = Date.now() + BLOCK_TIME;

    await fetch(`${API_BASE}/auth/block`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
    tg_id: user.id,
    until: blockedUntil
  })
});

    showBlockedScreen();
    return;
  }

  input = "";
  error = true;
  inputLocked = false;
  drawPin();
}

/* ===== BLOCKED ===== */
function showBlockedScreen(){
  // ⬅️ ГАРАНТИРУЕМ UI
  loading.style.display = "none";
  loading.style.pointerEvents = "none";

  app.style.display = "flex";
  app.style.pointerEvents = "auto";

  app.innerHTML = `
    <div class="blocked-screen">
      <div class="blocked-card">
        <div class="lock-icon">🔒</div>
        <div class="blocked-title">Слишком много попыток</div>
        <div class="blocked-timer" id="timer"></div>
      </div>
    </div>
  `;
  updateTimer();
}

function updateTimer(){
  const el = document.getElementById("timer");
  if (!el) return;

  const left = blockedUntil - Date.now();

  if (left <= 0) {
  blockedUntil = 0;
  attempts = 0;
  input = "";
  error = false;

  app.style.display = "flex";
  app.style.pointerEvents = "auto";

  drawPin();
  return;
}

  const m = String(Math.floor(left / 60000)).padStart(2, "0");
  const s = String(Math.floor(left / 1000) % 60).padStart(2, "0");

  el.textContent = `${m}:${s}`;

  setTimeout(updateTimer, 1000);
}

/* WELCOME */
function welcome(){
  app.innerHTML = `
    <div class="welcome-screen">
      <div class="welcome-card">

        <!-- PREMIUM SVG -->
        <svg class="welcome-svg" width="160" height="160"
             viewBox="0 0 160 160" fill="none"
             xmlns="http://www.w3.org/2000/svg">

          <defs>
            <linearGradient id="grad-main" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="50%" stop-color="#c7c7ff"/>
              <stop offset="100%" stop-color="#8affd6"/>
            </linearGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <circle cx="80" cy="80" r="66"
                  stroke="url(#grad-main)"
                  stroke-width="3"
                  opacity="0.6"
                  filter="url(#glow)"/>

          <rect x="44" y="44" width="72" height="72" rx="20"
                stroke="url(#grad-main)"
                stroke-width="3"
                fill="rgba(255,255,255,0.02)"
                filter="url(#glow)"/>

          <path d="M60 68h40M60 82h28"
                stroke="url(#grad-main)"
                stroke-width="4"
                stroke-linecap="round"/>

          <circle cx="104" cy="60" r="4"
                  fill="#8affd6"
                  filter="url(#glow)"/>
        </svg>

        <div class="welcome-title">Добро пожаловать</div>
        <div class="welcome-sub">
          в админ панель <b>BENTO TEAM</b>
        </div>

      </div>
    </div>
  `;

  setTimeout(menu, 1800);
}

/* ===== MENU ===== */
function menu(){
  app.innerHTML = `
    <div class="menu-wrap">
      <div class="menu-card">

        <div class="menu-title">
          👑 BENTO ADMIN
        </div>

        ${ROLE === "owner" ? `
          <div class="menu-btn" onclick="adminPanel()">
            <span class="menu-icon">👥</span>
            <span class="menu-text">Админы</span>
          </div>

          <div class="menu-btn" onclick="logsPanel()">
            <span class="menu-icon">📜</span>
            <span class="menu-text">Логи</span>
          </div>

          <div class="menu-btn danger" onclick="emergencyPanel()">
            <span class="menu-icon">🚨</span>
            <span class="menu-text">Экстренная ситуация</span>
          </div>
        ` : ""}

        <div class="menu-btn" onclick="requestsPanel()">
          <span class="menu-icon">📨</span>
          <span class="menu-text">Заявки</span>
        </div>

        <div class="menu-btn" onclick="settingsPanel()">
          <span class="menu-icon">⚙️</span>
          <span class="menu-text">Настройки</span>
        </div>

        <div class="menu-btn exit" onclick="tg.close()">
          <span class="menu-icon">🚪</span>
          <span class="menu-text">Выйти</span>
        </div>

      </div>
    </div>
  `;
}

/* ===== ADMINS ===== */
async function adminPanel(){
  if (!sb) {
  deny("error");
  return;
}
  
  if (ROLE !== "owner") return;

  app.innerHTML = `
    <div class="admin-wrap">
      <div class="admin-box">

        <div class="admin-title" onclick="menu()">← Админы</div>

        <div class="admin-form">
          <input id="a_name" placeholder="Имя админа">
          <input id="a_id" placeholder="Telegram ID" inputmode="numeric">
          <input id="a_pin" placeholder="PIN (если ADMIN)">
          <select id="a_role">
            <option value="admin">ADMIN</option>
            <option value="owner">OWNER</option>
          </select>
          <button onclick="addAdmin()">+ Добавить админа</button>
        </div>

        <div id="admins" class="admin-list"></div>

      </div>
    </div>
  `;

  loadAdmins();
}

async function loadAdmins(){
  const res = await fetch(`${API_BASE}/auth/admins`);
  if (!res.ok) {
    alert("Ошибка загрузки админов");
    return;
  }

  const data = await res.json();

  document.getElementById("admins").innerHTML =
    data.map(renderAdmin).join("");
}

function formatMSK(ts){
  if (!ts) return "—";

  return new Date(ts).toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function activityStatus(ts){
  if (!ts) {
    return {
      icon: "⚫",
      text: "offline"
    };
  }

  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);

  if (min <= 2) {
    return {
      icon: "🟢",
      text: "online"
    };
  }

  return {
    icon: "⚫",
    text: "offline"
  };
}

function renderAdmin(a){
  const blocked =
    a.blacklist &&
    a.blacklist.blocked_until &&
    Date.now() < a.blacklist.blocked_until;

  return `
    <div class="admin-card">
      <div class="admin-header">
        ${(() => {
          const st = activityStatus(a.last_activity);
          return `
            <div class="admin-name">
              ${a.name || "Без имени"}
              <span class="admin-status">
                ${st.icon} ${st.text} · ${formatMSK(a.last_activity)}
              </span>
            </div>
          `;
        })()}
        <div class="admin-role ${blocked ? "blocked" : a.role}">
          ${blocked ? "BLOCKED" : a.role.toUpperCase()}
        </div>
      </div>

      <div class="admin-info">ID ${a.tg_id}</div>

      ${a.role !== "owner" ? `
        <div class="pin">
          <div class="pin-code" id="pin-${a.tg_id}">••••</div>
          <div class="pin-btn" onclick="togglePin(${a.tg_id})">
            показать
          </div>
        </div>
      ` : ""}

      ${a.role !== "owner" ? `
        <div class="admin-actions">
          <button onclick="blockAdmin(${a.tg_id}, 300000)">5 мин</button>
          <button onclick="blockAdmin(${a.tg_id}, 0)">Навсегда</button>
          <button onclick="deleteAdmin(${a.tg_id})">Удалить</button>
        </div>
      ` : ""}
    </div>
  `;
}

async function addAdmin(){
  const name = document.getElementById("a_name").value.trim();
  const id   = Number(document.getElementById("a_id").value.trim());
  const role = document.getElementById("a_role").value;
  const pin  = document.getElementById("a_pin").value.trim();

  if (!name || !id) return alert("Заполни поля");

  const pin_hash =
    role === "admin" ? await hashPin(pin) : null;

  const res = await fetch(`${API_BASE}/auth/admins`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tg_id: id,
      name,
      role,
      pin_hash
    })
  });

  if (!res.ok) {
    alert("Ошибка добавления");
    return;
  }

  tg.HapticFeedback.notificationOccurred("success");
  loadAdmins();
}

async function blockAdmin(tg_id, time){
  if (tg_id === user.id) {
    alert("Нельзя заблокировать себя");
    return;
  }

  const PERMA_BAN = 9999999999999; // Огромный timestamp на очень долгий срок

  const until = time === 0 ? PERMA_BAN : Date.now() + time;

  await fetch(`${API_BASE}/auth/block`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tg_id,
      until,
      reason: "admin_panel"
    })
  });

  // Если это блокировка пользователя, который залогинен — сразу кикаем
if (tg_id === user.id) {
  kickUser({ reason: "permanent_ban" });

  loadAdmins();
}

function togglePin(id){
  const el = document.getElementById(`pin-${id}`);
  el.textContent = el.textContent === "••••" ? "СКРЫТО" : "••••";
}

async function deleteAdmin(tg_id){
  if (!confirm("Удалить админа?")) return;

  const res = await fetch(`${API_BASE}/auth/admins/${tg_id}`, {
    method: "DELETE"
  });

  if (!res.ok) {
    alert("Ошибка удаления админа");
    return;
  }

  tg.HapticFeedback.notificationOccurred("success");
  loadAdmins();
}

function logsPanel(){
  if (ROLE !== "owner") return;
  app.innerHTML = `
    <div class="card">
      <div class="menu-title">📜 Логи</div>
      <div class="menu-sub">Скоро будет</div>
      <div class="menu-btn" onclick="menu()">← Назад</div>
    </div>
  `;
}

function emergencyPanel(){
  if (ROLE !== "owner") return;

  if (!confirm("⚠️ Экстренная панель. Продолжить?")) return;

  app.innerHTML = `
    <div class="card danger">
      <div class="menu-title">🚨 Экстренная ситуация</div>
      <div class="menu-sub">Доступ только для OWNER</div>
      <div class="menu-btn" onclick="menu()">← Назад</div>
    </div>
  `;
}

/* ===== REQUESTS ===== */
function requestsPanel(){
  app.innerHTML = `
    <div class="admin-wrap">
      <div class="admin-box">

        <div class="admin-title" onclick="menu()">← Заявки</div>

        ${ROLE === "owner" ? `
          <div class="request-filters">
            <button class="filter-btn active" onclick="setRequestFilter('pending')">
              📨 Новые
            </button>
            <button class="filter-btn" onclick="setRequestFilter('approved')">
              ✅ Принятые
            </button>
            <button class="filter-btn" onclick="setRequestFilter('rejected')">
              ❌ Отклонённые
            </button>
          </div>
        ` : ""}

        <div class="admin-list" id="requests-list"></div>

      </div>
    </div>
  `;

  loadRequests();
}

function setRequestFilter(type){
  REQUEST_FILTER = type;

  document.querySelectorAll(".filter-btn").forEach(b =>
    b.classList.remove("active")
  );

  const map = {
  pending: 0,
  approved: 1,
  rejected: 2
};

  document.querySelectorAll(".filter-btn")[map[type]]
    .classList.add("active");

  loadRequests();
}

async function loadRequests(){
  const res = await fetch(`${API_BASE}/auth/requests`);
  const data = await res.json();

  const el = document.getElementById("requests-list");

  let list = data;

  // 🔒 ADMIN видит только новые
  if (ROLE !== "owner") {
    list = data.filter(r => r.status === "pending");
  } else {
    list = data.filter(r => r.status === REQUEST_FILTER);
  }

  if (!list.length) {
    el.innerHTML = `
      <div class="admin-card">
        <div class="admin-header">
          <div class="admin-name">
            Нет заявок
            <span class="admin-status">📭 пусто</span>
          </div>
          <div class="admin-role admin">INFO</div>
        </div>

        <div class="admin-info">
          Заявок в этой категории нет
        </div>
      </div>
    `;
    return;
  }

  el.innerHTML = list.map(renderRequest).join("");
}

function renderRequest(r){
  return `
    <div class="admin-card">
      <div class="admin-header">
        <div class="admin-name">
          ${r.username ? `@${r.username}` : (r.first_name || "Без имени")}
          <span class="admin-status">
            ${new Date(r.created_at).toLocaleString("ru-RU")}
          </span>
        </div>
        <div class="admin-role ${r.status}">
          ${r.status.toUpperCase()}
        </div>
      </div>

      <div class="admin-info">
        <b>Возраст:</b> ${r.age}<br>
        <b>Опыт:</b> ${r.experience}<br>
        <b>Капитал:</b> ${r.capital}<br>
        <b>Часовой пояс:</b> ${r.timezone}<br><br>

        <b>О себе:</b><br>
        ${r.about || "-"}<br><br>

        <b>Мотивация:</b><br>
        ${r.motivation || "-"}
      </div>

      <div class="admin-actions">
        ${
          r.status === "pending"
            ? `
              <button onclick="updateRequest('${r.id}','approved', this)">
                ✅ Принять
              </button>
              <button onclick="updateRequest('${r.id}','rejected', this)">
                ❌ Отклонить
              </button>
            `
            : `
              <button class="danger"
                onclick="deleteRequest('${r.id}')">
                🗑 Удалить
              </button>
            `
        }
      </div>
    </div>
  `;
}

async function updateRequest(id, status, btn){
  const card = btn.closest(".admin-card");

  card.style.opacity = "0.4";
  card.style.pointerEvents = "none";

  const res = await fetch(`${API_BASE}/auth/requests/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status,
      admin_id: user.id
    })
  });

  if (!res.ok) {
    alert("Ошибка обработки заявки");
    card.style.opacity = "1";
    card.style.pointerEvents = "auto";
    return;
  }

  card.remove();
}

async function deleteRequest(id) {
  if (!confirm("Удалить заявку безвозвратно?")) return;

  const res = await fetch(`${API_BASE}/auth/requests/${id}`, {
    method: "DELETE"
  });

  if (!res.ok) {
    alert("Ошибка удаления заявки");
    return;
  }

  loadRequests();
}

function settingsPanel(){
  app.innerHTML = `
    <div class="card">
      <div class="menu-title">⚙️ Настройки</div>
      <div class="menu-sub">В разработке</div>
      <div class="menu-btn" onclick="menu()">← Назад</div>
    </div>
  `;
}

/* ===== INIT ===== */
(async () => {
  try {
    await initSupabase();
    await start();
  } catch (e) {
    console.error(e);
    loading.innerHTML = "❌ Ошибка запуска";
  }
})();

setTimeout(() => {
  if (
    !denied &&
    loading.style.display !== "none" &&
    app.style.display === "none"
  ) {
    loading.innerHTML = "🌐 Проверьте интернет соединение";
    setTimeout(() => tg.close(), 2000);
  }
}, 4000);