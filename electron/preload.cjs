const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("bloodmcDesktop", {
  request: (request) => ipcRenderer.invoke("primehost-request", request)
});
