const { app: o, BrowserWindow: t } = require("electron"), n = require("path");
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = !0;
let e;
const i = () => {
  e = new t({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: !1,
      // is default value after Electron v5
      contextIsolation: !0,
      // protect against prototype pollution
      preload: n.join(__dirname, "preload.js")
    }
  }), process.env.NODE_ENV !== "production" ? e.loadURL("http://localhost:5173") : e.loadFile(n.join(__dirname, "../renderer/index.html")), e.webContents.openDevTools();
};
o.whenReady().then(i);
o.on("window-all-closed", () => {
  process.platform !== "darwin" && o.quit();
});
o.on("activate", () => {
  t.getAllWindows().length === 0 && i();
});
