import { app, BrowserWindow, ipcMain } from 'electron';
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

const CONFIG_PATH = 'C:\\Users\\johnn\\AppData\\Roaming\\Claude\\claude_desktop_config.json';

// Ensure config directory exists
async function ensureConfigDir() {
  try {
    await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating config directory:', error.message);
    } else {
      console.error('Unknown error creating config directory');
    }
  }
}

// Read config file
async function readConfig(): Promise<MCPConfig> {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    return JSON.parse(data) as MCPConfig;
  } catch (error) {
    if (error instanceof Error) {
      if ('code' in error && error.code === 'ENOENT') {
        // Return default config if file doesn't exist
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
async function writeConfig(config: MCPConfig) {
  await ensureConfigDir();
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

// Set up IPC handlers
function setupIPC() {
  ipcMain.handle('get-config', async () => {
    return await readConfig();
  });

  ipcMain.handle('save-config', async (_, config: MCPConfig) => {
    try {
      await writeConfig(config);
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

app.on('ready', async () => {
  setupIPC();
  await createWindow();
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
