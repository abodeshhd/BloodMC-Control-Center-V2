const { app, BrowserWindow, dialog, shell } = require("electron");

const APP_URL = process.env.BLOODMC_APP_URL;
let win;

function createWindow() {
  if (!APP_URL || !/^https:\/\//i.test(APP_URL)) {
    dialog.showErrorBox(
      "BloodMC Control Center",
      "Set BLOODMC_APP_URL to your deployed HTTPS dashboard URL before building or launching the desktop app."
    );
    app.quit();
    return;
  }

  win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 980,
    minHeight: 680,
    backgroundColor: "#080910",
    autoHideMenuBar: true,
    title: "BloodMC Control Center",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) shell.openExternal(url);
    return { action: "deny" };
  });
  win.loadURL(APP_URL);
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
