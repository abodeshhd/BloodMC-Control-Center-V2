const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");
let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1440, height: 920, minWidth: 360, minHeight: 600,
    backgroundColor: "#080910", autoHideMenuBar: true,
    title: "BloodMC Control Center",
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
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
