import { IpcRenderer } from 'electron';
import { MCPConfig } from '../components/mcp-config-editor-main';

declare global {
  interface Window {
    ipcRenderer: Pick<IpcRenderer, 'invoke'>;
  }
}

export {};
