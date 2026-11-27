const $ = (id) => document.getElementById(id);
let dashboardPassword = "";
let refreshTimer = null;
const API_BASE = String(window.BLOODMC_API_BASE_URL || "").replace(/\/$/, "");

async function api(path, options = {}) {
  const response = await fetch(new URL(path, API_BASE || window.location.href), {
    ...options,
    headers: { "Content-Type": "application/json", "x-dashboard-password": dashboardPassword, ...(options.headers || {}) }
  });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
  return data;
}

function bytes(value) {
  if (!Number.isFinite(value)) return "—";
  const units = ["B", "MB", "GB", "TB"];
  let n = value, i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(1)} ${units[i]}`;
}

function setState(state) {
  const running = state === "running";
  $("statusDot").classList.toggle("online", running);
  $("statusText").textContent = running ? "Online" : (state || "Unknown");
  $("serverState").textContent = running ? "يعمل" : (state || "غير معروف");
}

async function refresh() {
  const [server, resourceData] = await Promise.all([api("/api/server"), api("/api/resources")]);
  const attr = server?.attributes || {};
  const resources = resourceData?.attributes?.resources || {};
  setState(resourceData?.attributes?.current_state || "unknown");
  $("serverName").textContent = attr.name || "BloodMC";
  $("cpu").textContent = Number.isFinite(resources.cpu_absolute) ? `${resources.cpu_absolute.toFixed(1)}%` : "—";
  $("memory").textContent = bytes(resources.memory_bytes);
  $("memoryLimit").textContent = `من ${bytes(resources.memory_limit_bytes)}`;
  $("disk").textContent = bytes(resources.disk_bytes);
  $("diskLimit").textContent = `من ${bytes((attr.limits?.disk || 0) * 1024 * 1024)}`;
}

function logout() {
  dashboardPassword = "";
  clearInterval(refreshTimer);
  $("password").value = "";
  $("dashboard").hidden = true;
  $("loginPanel").hidden = false;
  $("loginMessage").textContent = "تم تسجيل الخروج.";
}

$("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  dashboardPassword = $("password").value;
  $("loginMessage").textContent = "جارٍ التحقق من الاتصال...";
  try {
    await refresh();
    $("loginPanel").hidden = true;
    $("dashboard").hidden = false;
    $("loginMessage").textContent = "تم الاتصال.";
    refreshTimer = setInterval(() => refresh().catch((e) => $("actionMessage").textContent = e.message), 15000);
  } catch (error) {
    dashboardPassword = "";
    $("loginMessage").textContent = error.message;
  }
});

document.querySelectorAll("[data-power]").forEach((button) => {
  button.addEventListener("click", async () => {
    const signal = button.dataset.power;
    if (signal === "stop" && !confirm("هل تريد إيقاف السيرفر؟")) return;
    if (signal === "restart" && !confirm("هل تريد إعادة تشغيل السيرفر؟")) return;
    button.disabled = true;
    $("actionMessage").textContent = "جارٍ إرسال الطلب...";
    try {
      await api("/api/power", { method: "POST", body: JSON.stringify({ signal }) });
      $("actionMessage").textContent = "تم إرسال الطلب بنجاح.";
      setTimeout(() => refresh().catch(() => {}), 2500);
    } catch (error) { $("actionMessage").textContent = error.message; }
    finally { button.disabled = false; }
  });
});

$("commandForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const command = $("command").value.trim();
  if (!command) return;
  try {
    await api("/api/command", { method: "POST", body: JSON.stringify({ command }) });
    $("actionMessage").textContent = "تم إرسال الأمر.";
    $("command").value = "";
  } catch (error) { $("actionMessage").textContent = error.message; }
});

$("refresh").addEventListener("click", () => refresh().then(() => $("actionMessage").textContent = "تم تحديث البيانات.").catch(e => $("actionMessage").textContent = e.message));
$("logout").addEventListener("click", logout);
const setupForm = $("setupForm");
if (setupForm) setupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = setupForm.querySelector("button");
  button.disabled = true;
  $("setupMessage").textContent = "جارٍ حفظ الإعداد بشكل آمن...";
  try {
    const response = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setupSecret: $("setupSecret").value,
        apiKey: $("apiKeyInput").value,
        dashboardPassword: $("newDashboardPassword").value
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "تعذر حفظ الإعداد.");
    setupForm.reset();
    $("setupPanel").hidden = true;
    $("setupMessage").textContent = data.message || "تم الحفظ.";
    $("loginMessage").textContent = "الإعداد جاهز. سجل الدخول بكلمة المرور التي أنشأتها.";
  } catch (error) {
    $("setupMessage").textContent = error.message;
  } finally { button.disabled = false; }
});
