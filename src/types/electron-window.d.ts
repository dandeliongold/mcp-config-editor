import { IpcRenderer } from 'electron';
import { MCPConfig } from '../components/mcp-config-editor-main';

declare global {
  interface Window {
    ipcRenderer: {
      invoke(channel: 'get-config'): Promise<MCPConfig>;
      invoke(channel: 'save-config', config: MCPConfig): Promise<boolean>;
      invoke(channel: 'get-config-path'): Promise<string>;
      invoke(channel: 'select-config-file'): Promise<string | null>;
    };
  }
}

export {};
