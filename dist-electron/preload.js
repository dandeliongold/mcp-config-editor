const { contextBridge: a, ipcRenderer: i } = require("electron");
a.exposeInMainWorld(
  "api",
  {
    // Example IPC communication
    send: (e, n) => {
      ["toMain"].includes(e) && i.send(e, n);
    },
    receive: (e, n) => {
      ["fromMain"].includes(e) && i.on(e, (s, ...l) => n(...l));
    }
  }
);
