const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("node:path");
let win;
const PANEL_ORIGIN = "https://panel.primehost.cc";
const API_PREFIX = "/api/client/servers/cb21b17b";
const ALLOWED = new Set(["","/resources","/power","/command","/files/list","/files/contents","/files/create-folder","/files/delete","/files/write"]);
ipcMain.handle("primehost-request", async (_event, request) => {
  let target;
  try { target = new URL(String(request?.url || "")); } catch { throw new Error("عنوان PrimeHost غير صالح."); }
  const route = target.pathname.startsWith(API_PREFIX) ? target.pathname.slice(API_PREFIX.length) : null;
  if (target.origin !== PANEL_ORIGIN || route === null || !ALLOWED.has(route)) throw new Error("تم رفض طلب API غير مسموح.");
  const method = String(request?.method || "GET").toUpperCase();
  if (!["GET","POST"].includes(method)) throw new Error("طريقة الطلب غير مسموحة.");
  if ((route === "/files/list" && method !== "GET") || (route === "/files/contents" && method !== "GET") || (["/files/create-folder","/files/delete","/files/write","/power","/command"].includes(route) && method !== "POST")) throw new Error("طريقة الطلب لا تطابق المسار.");
  const authorization = String(request?.headers?.Authorization || "");
  if (!authorization.startsWith("Bearer ") || authorization.length < 20) throw new Error("أدخل مفتاح PrimeHost Client API صالحاً.");
  const headers = { Authorization: authorization, Accept: "Application/vnd.pterodactyl.v1+json" };
  const contentType = request?.headers?.["Content-Type"] || request?.headers?.["content-type"];
  if (contentType) headers["Content-Type"] = contentType;
  let response;
  try {
    response = await fetch(target, { method, headers, body: method === "POST" ? (request.body ?? "") : undefined, signal: AbortSignal.timeout(25000) });
  } catch (error) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") throw new Error("انتهت مهلة الاتصال بـ PrimeHost.");
    throw new Error("تعذر الاتصال بـ PrimeHost عبر HTTPS: " + String(error?.message || error));
  }
  const raw = response.status === 204 ? "" : await response.text();
  let data = null;
  if (raw) { try { data = JSON.parse(raw); } catch { data = raw; } }
  return { status: response.status, data };
});
function createWindow() {
  win = new BrowserWindow({ width: 1440, height: 920, minWidth: 360, minHeight: 600, backgroundColor: "#100407", autoHideMenuBar: true, title: "BloodMC Control Center V2", webPreferences: { preload: path.join(__dirname,"preload.cjs"), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  win.webContents.setWindowOpenHandler(({url}) => { if (url.startsWith("https://")) shell.openExternal(url); return {action:"deny"}; });
  win.loadFile(path.join(app.getAppPath(),"index.html"));
}
app.whenReady().then(createWindow);
app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit()});
app.on("activate",()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()});