"use strict";
const { app, BrowserWindow } = require("electron");
const path = require("path");
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
let mainWindow;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      // is default value after Electron v5
      contextIsolation: true,
      // protect against prototype pollution
      preload: path.join(__dirname, "preload.js")
    }
  });
  if (process.env.NODE_ENV !== "production") {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  mainWindow.webContents.openDevTools();
};
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
