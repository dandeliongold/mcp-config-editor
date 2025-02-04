import { ipcRenderer, contextBridge } from 'electron';

// Typed IPC interface
interface IpcApi {
  invoke(channel: 'get-config'): Promise<any>;
  invoke(channel: 'save-config', config: any): Promise<boolean>;
  invoke(channel: 'get-config-path'): Promise<string>;
  invoke(channel: 'select-config-file'): Promise<string | null>;
  invoke(channel: string, ...args: any[]): Promise<any>;
  on(channel: string, func: (...args: any[]) => void): void;
  off(channel: string, func: (...args: any[]) => void): void;
}

// Expose protected IPC methods to renderer
contextBridge.exposeInMainWorld(
  'ipcRenderer',
  {
    invoke: async (channel: string, ...args: any[]) => {
      const validChannels = ['get-config', 'save-config', 'get-config-path', 'select-config-file'];
      if (validChannels.includes(channel)) {
        return await ipcRenderer.invoke(channel, ...args);
      }
      throw new Error(`Invalid IPC channel: ${channel}`);
    },
    on: (channel: string, func: (...args: any[]) => void) => {
      const validChannels = ['main-process-message'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (_event, ...args) => func(...args));
      }
    },
    off: (channel: string, func: (...args: any[]) => void) => {
      const validChannels = ['main-process-message'];
      if (validChannels.includes(channel)) {
        ipcRenderer.off(channel, func);
      }
    },
  } as IpcApi
);
