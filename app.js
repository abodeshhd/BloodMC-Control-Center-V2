const $ = (id) => document.getElementById(id);
let apiKey = "";
let refreshTimer = null;
const PANEL_BASE = "https://panel.primehost.cc/api/client/servers/cb21b17b";

function parseBody(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { message: text.slice(0, 500) }; }
}

function explainApiError(status, data) {
  const detail = data?.errors?.[0]?.detail || data?.message || data?.error;
  if (status === 401) return "رفض PrimeHost المفتاح (401). أنشئ Client API Key جديداً وتأكد أنه غير ملغى.";
  if (status === 403) return "المفتاح صحيح لكن لا يملك صلاحية الوصول لهذا السيرفر (403).";
  if (status === 404) return "لم يتم العثور على السيرفر أو مسار API (404). تحقق من Server Identifier في PrimeHost.";
  if (status === 409) return "PrimeHost رفض العملية بسبب حالة السيرفر الحالية (409).";
  if (status === 422) return `بيانات الطلب غير مقبولة (422).${detail ? " " + detail : ""}`;
  if (status === 429) return "طلبات كثيرة. انتظر قليلاً ثم حاول مجدداً (429).";
  if (status >= 500) return `خلل مؤقت من خادم PrimeHost (HTTP ${status}).`;
  return `فشل طلب PrimeHost (HTTP ${status}).${detail ? " " + detail : ""}`;
}

async function api(path, options = {}) {
  if (!apiKey) throw new Error("أدخل مفتاح Client API أولاً.");
  const url = `${PANEL_BASE}${path}`;
  const headers = {
    Accept: "Application/vnd.pterodactyl.v1+json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    ...(options.headers || {})
  };
  let status, data;
  try {
    if (window.bloodmcDesktop?.request) {
      const result = await window.bloodmcDesktop.request({
        url, method: options.method || "GET", headers, body: options.body || null
      });
      status = result.status;
      data = result.data;
    } else {
      // CapacitorHttp is enabled in capacitor.config.js and transparently
      // routes fetch through native HTTPS on Android (avoids browser CORS).
      const response = await fetch(url, { ...options, headers });
      status = response.status;
      data = parseBody(response.status === 204 ? "" : await response.text());
    }
  } catch (error) {
    const message = String(error?.message || error);
    if (/timeout|timed out|aborted/i.test(message)) throw new Error("انتهت مهلة الاتصال بـ PrimeHost. تحقق من الإنترنت وحاول مجدداً.");
    if (/failed to fetch|network|internet|connection|ssl|certificate/i.test(message)) {
      throw new Error("تعذر الوصول إلى PrimeHost عبر HTTPS. تحقق من الإنترنت أو جرّب شبكة أخرى. (" + message + ")");
    }
    throw new Error("تعذر تنفيذ طلب API: " + message);
  }
  if (status < 200 || status >= 300) throw new Error(explainApiError(status, data));
  return data;
}

function bytes(value) {
  if (!Number.isFinite(value)) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
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
  const [server, resourceData] = await Promise.all([api(""), api("/resources")]);
  const attr = server?.attributes || {};
  const resources = resourceData?.attributes?.resources || {};
  setState(resourceData?.attributes?.current_state || "unknown");
  $("serverName").textContent = attr.name || "BloodMC";
  $("cpu").textContent = Number.isFinite(resources.cpu_absolute) ? `${resources.cpu_absolute.toFixed(1)}%` : "—";
  $("memory").textContent = bytes(resources.memory_bytes);
  $("memoryLimit").textContent = `من ${bytes(resources.memory_limit_bytes)}`;
  $("disk").textContent = bytes(resources.disk_bytes);
  $("diskLimit").textContent = `من ${(attr.limits?.disk || 0).toLocaleString("en-US")} MB`;
}

function logout() {
  apiKey = "";
  clearInterval(refreshTimer);
  $("apiKey").value = "";
  $("dashboard").hidden = true;
  $("loginPanel").hidden = false;
  $("loginMessage").textContent = "تم تسجيل الخروج. تم مسح المفتاح من الذاكرة.";
}

$("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  apiKey = $("apiKey").value.trim();
  if (!apiKey) return;
  $("loginMessage").textContent = "جارٍ الاتصال المباشر بـ PrimeHost...";
  try {
    await refresh();
    $("loginPanel").hidden = true;
    $("dashboard").hidden = false;
    $("loginMessage").textContent = "تم الاتصال بسيرفر BloodMC.";
    clearInterval(refreshTimer);
    refreshTimer = setInterval(() => refresh().catch((e) => $("actionMessage").textContent = e.message), 15000);
  } catch (error) {
    apiKey = "";
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
      await api("/power", { method: "POST", body: JSON.stringify({ signal }) });
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
    await api("/command", { method: "POST", body: JSON.stringify({ command }) });
    $("actionMessage").textContent = "تم إرسال الأمر.";
    $("command").value = "";
  } catch (error) { $("actionMessage").textContent = error.message; }
});

$("refresh").addEventListener("click", () => refresh().then(() => $("actionMessage").textContent = "تم تحديث البيانات.").catch(e => $("actionMessage").textContent = e.message));
$("logout").addEventListener("click", logout);
$("loginPanel").hidden = false;
