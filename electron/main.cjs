const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("node:path");
let win;

const PANEL_ORIGIN = "https://panel.primehost.cc";
const ALLOWED_PATHS = new Set([
  "/api/client/servers/cb21b17b",
  "/api/client/servers/cb21b17b/resources",
  "/api/client/servers/cb21b17b/power",
  "/api/client/servers/cb21b17b/command"
]);

ipcMain.handle("primehost-request", async (_event, request) => {
  let target;
  try { target = new URL(String(request?.url || "")); }
  catch { throw new Error("عنوان PrimeHost غير صالح."); }
  if (target.origin !== PANEL_ORIGIN || !ALLOWED_PATHS.has(target.pathname) || target.search) {
    throw new Error("تم رفض طلب API غير مسموح.");
  }

  const method = request?.method === "POST" ? "POST" : "GET";
  const authorization = String(request?.headers?.Authorization || "");
  if (!authorization.startsWith("Bearer ") || authorization.length < 20) {
    throw new Error("أدخل مفتاح PrimeHost Client API صالحاً.");
  }

  let response;
  try {
    response = await fetch(target, {
      method,
      headers: {
        Authorization: authorization,
        Accept: "Application/vnd.pterodactyl.v1+json",
        "Content-Type": "application/json"
      },
      body: method === "POST" ? (request.body || "{}") : undefined,
      signal: AbortSignal.timeout(20000)
    });
  } catch (error) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      throw new Error("انتهت مهلة الاتصال بـ PrimeHost.");
    }
    throw new Error("تعذر الاتصال بـ PrimeHost عبر HTTPS: " + String(error?.message || error));
  }

  const raw = response.status === 204 ? "" : await response.text();
  let data = null;
  if (raw) {
    try { data = JSON.parse(raw); }
    catch { data = { message: raw.slice(0, 500) }; }
  }
  return { status: response.status, data };
});

function createWindow() {
  win = new BrowserWindow({
    width: 1440, height: 920, minWidth: 360, minHeight: 600,
    backgroundColor: "#080910", autoHideMenuBar: true,
    title: "BloodMC Control Center",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) shell.openExternal(url);
    return { action: "deny" };
  });
  win.loadFile(path.join(app.getAppPath(), "index.html"));
}
app.whenReady().then(createWindow);
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
