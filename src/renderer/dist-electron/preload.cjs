import require$$0 from "electron";
var preload = {};
const { contextBridge, ipcRenderer } = require$$0;
contextBridge.exposeInMainWorld(
  "api",
  {
    // Example IPC communication
    send: (channel, data) => {
      let validChannels = ["toMain"];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      let validChannels = ["fromMain"];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  }
);
export {
  preload as default
};
