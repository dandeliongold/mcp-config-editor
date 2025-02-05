import { app, BrowserWindow, ipcMain, Menu, dialog, MenuItemConstructorOptions, shell } from 'electron';
import type { SaveDialogReturnValue, OpenDialogReturnValue } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs/promises';

interface MCPConfig {
  mcpServers: Record<string, {
    command: string;
    args: string[];
    env: Record<string, string>;
  }>;
}

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getDefaultConfigPath = () => {
  if (process.platform === 'darwin') {
    // macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
    return path.join(app.getPath('home'), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else {
    // Windows: %APPDATA%\Claude\claude_desktop_config.json
    return path.join(app.getPath('appData'), 'Claude', 'claude_desktop_config.json');
  }
};

const DEFAULT_CONFIG_PATH = getDefaultConfigPath();
let currentConfigPath = DEFAULT_CONFIG_PATH;

// Load last used config path
async function loadLastConfigPath(): Promise<string> {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json');
    const data = await fs.readFile(settingsPath, 'utf-8');
    const settings = JSON.parse(data);
    return settings.lastConfigPath || DEFAULT_CONFIG_PATH;
  } catch {
    return DEFAULT_CONFIG_PATH;
  }
}

// Save last used config path
async function saveLastConfigPath(configPath: string) {
  const settingsPath = path.join(app.getPath('userData'), 'settings.json');
  try {
    let settings = {};
    try {
      const data = await fs.readFile(settingsPath, 'utf-8');
      settings = JSON.parse(data);
    } catch {}
    settings = { ...settings, lastConfigPath: configPath };
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Ensure config directory exists
async function ensureConfigDir(configPath: string) {
  try {
    await fs.mkdir(path.dirname(configPath), { recursive: true });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating config directory:', error.message);
    } else {
      console.error('Unknown error creating config directory');
    }
  }
}

// Read config file
async function readConfig(configPath: string = currentConfigPath): Promise<MCPConfig> {
  console.log('Reading config from:', configPath);
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(data) as MCPConfig;
    console.log('Loaded config:', config);
    return config;
  } catch (error) {
    if (error instanceof Error) {
      if ('code' in error && error.code === 'ENOENT') {
        console.log('Config file not found, returning empty config');
        return { mcpServers: {} };
      }
      console.error('Error reading config:', error.message);
    } else {
      console.error('Unknown error reading config');
    }
    // Return default config for any error
    return { mcpServers: {} };
  }
}

// Write config file
async function writeConfig(config: MCPConfig, configPath: string = currentConfigPath) {
  await ensureConfigDir(configPath);
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

// Set up IPC handlers
function setupIPC() {
  ipcMain.handle('get-config', async () => {
    console.log('IPC: get-config called');
    const config = await readConfig(currentConfigPath);
    console.log('IPC: Returning config:', config);
    return config;
  });

  ipcMain.handle('save-config', async (_, config: MCPConfig) => {
    try {
      await writeConfig(config, currentConfigPath);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error saving config:', error.message);
      } else {
        console.error('Unknown error saving config');
      }
      return false;
    }
  });

  ipcMain.handle('get-config-path', () => currentConfigPath);

  ipcMain.handle('export-config', async (_, config: MCPConfig) => {
    try {
      const downloadsPath = app.getPath('downloads');
      const defaultPath = path.join(downloadsPath, 'mcp-config.json');
      
      if (!mainWindow) return false;

      const saveResult = await dialog.showSaveDialog(mainWindow, {
        title: 'Export MCP Configuration',
        defaultPath,
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['createDirectory', 'showOverwriteConfirmation']
      }) as unknown as SaveDialogReturnValue;

      if (!saveResult.canceled && saveResult.filePath) {
        try {
          await fs.writeFile(saveResult.filePath, JSON.stringify(config, null, 2), 'utf-8');
          return true;
        } catch (error) {
          console.error('Error writing config file:', error);
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Error in export dialog:', error);
      return false;
    }
  });

  ipcMain.handle('select-config-file', async () => {
    if (!mainWindow) return null;

    const openResult = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'createDirectory'],
      filters: [{ name: 'JSON', extensions: ['json'] }],
      defaultPath: currentConfigPath
    }) as unknown as OpenDialogReturnValue;

    if (!openResult.canceled && openResult.filePaths.length > 0) {
      const newPath = openResult.filePaths[0];
      currentConfigPath = newPath;
      await saveLastConfigPath(newPath);
      return newPath;
    }
    return null;
  });
}

// Store window state
let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  console.log('Creating a new window');
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#f3f4f6', // Matches Tailwind's bg-gray-100
    center: true,
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createApplicationMenu() {
  const isMac = process.platform === 'darwin';
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Config File',
          click: async () => {
            if (!mainWindow) return;

            const openResult = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [{ name: 'JSON', extensions: ['json'] }],
              defaultPath: currentConfigPath
            }) as unknown as OpenDialogReturnValue;

            if (!openResult.canceled && openResult.filePaths.length > 0) {
              const newPath = openResult.filePaths[0];
              currentConfigPath = newPath;
              await saveLastConfigPath(newPath);
              mainWindow?.webContents.send('config-path-changed', newPath);
            }
          }
        },
        {
          label: 'Save',
          click: () => {
            mainWindow?.webContents.send('menu-save-config');
          }
        },
        {
          label: 'Export',
          click: () => {
            mainWindow?.webContents.send('menu-export-config');
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'toggleDevTools' }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Report Issue',
          click: async () => {
            await shell.openExternal('https://github.com/dandeliongold/mcp-config-editor/issues/new/choose');
          }
        },
        {
          label: 'About',
          click: async () => {
            if (!mainWindow) return;
            const version = app.getVersion();
            await dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About MCP Config Editor',
              message: 'MCP Config Editor',
              detail: `Version ${version}\n\nA desktop application for managing Model Context Protocol (MCP) server configurations.`,
              buttons: ['OK'],
              noLink: true
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.on('ready', async () => {
  currentConfigPath = await loadLastConfigPath();
  setupIPC();
  await createWindow();
  createApplicationMenu();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (mainWindow === null) {
    await createWindow();
  }
});

// Handle any uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});
