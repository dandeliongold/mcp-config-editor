import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, FileJson } from 'lucide-react';
import JsonImport from './mcp-config-json-import';
import ServerCard from './mcp-config-server-card';
import SaveControls from './mcp-config-controls';
import ErrorBoundary from './error-boundary';

export interface ServerConfig {
  command: string;
  args: string[];
  env: Record<string, string>;
}

export interface MCPConfig {
  mcpServers: Record<string, ServerConfig>;
}

const MCPConfigEditor = () => {
  const [config, setConfig] = useState<MCPConfig>({
    mcpServers: {}
  });
  const [newServerName, setNewServerName] = useState('');
  const [showJsonInput, setShowJsonInput] = useState(false);
  const [lastWorkingConfig, setLastWorkingConfig] = useState<MCPConfig | null>(null);
  const [showUndoAlert, setShowUndoAlert] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        if (window.ipcRenderer) {
          const loadedConfig = await window.ipcRenderer.invoke('get-config');
          setConfig(loadedConfig);
        } else {
          console.log('Running in development mode without Electron');
          setConfig({
            mcpServers: {
              'puppeteer': {
                command: 'npx',
                args: ['-y', '@modelcontextprotocol/server-puppeteer'],
                env: {}
              }
            }
          });
        }
      } catch (error) {
        console.error('Failed to load config:', error);
      }
    };

    loadConfig();
  }, []);

  const storeBackup = () => {
    const backup = JSON.parse(JSON.stringify(config));
    console.log('Storing backup:', backup);
    setLastWorkingConfig(backup);
  };

  const addNewServer = () => {
    if (newServerName && !config.mcpServers[newServerName]) {
      storeBackup();
      setConfig(prev => ({
        ...prev,
        mcpServers: {
          ...prev.mcpServers,
          [newServerName]: {
            command: '',
            args: [],
            env: {}
          }
        }
      }));
      setNewServerName('');
    }
  };

  const handleServerUpdate = (serverName: string, newServerConfig: ServerConfig) => {
    storeBackup();
    setConfig(prev => ({
      ...prev,
      mcpServers: {
        ...prev.mcpServers,
        [serverName]: newServerConfig
      }
    }));
  };

  const handleServerRemove = (serverName: string) => {
    storeBackup();
    setConfig(prev => {
      const newConfig = { ...prev };
      const newServers = { ...prev.mcpServers };
      delete newServers[serverName];
      newConfig.mcpServers = newServers;
      return newConfig;
    });
  };

  const handleJsonImport = (importedConfig: MCPConfig) => {
    storeBackup();
    setConfig(prev => ({
      ...prev,
      mcpServers: {
        ...prev.mcpServers,
        ...importedConfig.mcpServers
      }
    }));
    setShowJsonInput(false);
  };

  const handleSave = async () => {
    try {
      if (window.ipcRenderer) {
        await window.ipcRenderer.invoke('save-config', config);
      } else {
        console.log('Development mode: Config would be saved as:', config);
      }
      setShowUndoAlert(true);
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  const handleUndo = () => {
    if (lastWorkingConfig) {
      console.log('Restoring to backup config:', lastWorkingConfig);
      // Create a new object to ensure state update
      setConfig(JSON.parse(JSON.stringify(lastWorkingConfig)));
      setLastWorkingConfig(null);
      setShowUndoAlert(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl font-medium">MCP Server Configuration</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Add New Server Controls */}
          <div className="flex gap-2 items-center">
            <Input
              placeholder="New server name"
              value={newServerName}
              onChange={(e) => setNewServerName(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={addNewServer} 
              variant="outline"
              className="h-10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Server
            </Button>
            <Button 
              onClick={() => setShowJsonInput(!showJsonInput)} 
              variant="outline"
              className="h-10"
            >
              <FileJson className="w-4 h-4 mr-2" />
              Import JSON
            </Button>
          </div>

          {/* JSON Import Section */}
          {showJsonInput && (
            <JsonImport
              onImport={handleJsonImport}
              onCancel={() => setShowJsonInput(false)}
            />
          )}

          {/* Server List */}
          <div className="space-y-4">
            {Object.entries(config.mcpServers)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([serverName, serverConfig]) => (
              <ErrorBoundary key={serverName}>
                <ServerCard
                  serverName={serverName}
                  serverConfig={serverConfig}
                  onUpdate={handleServerUpdate}
                  onRemove={handleServerRemove}
                />
              </ErrorBoundary>
            ))}
          </div>

          {/* Save Controls */}
          <SaveControls
            onSave={handleSave}
            onUndo={handleUndo}
            showUndoAlert={showUndoAlert}
            hasBackup={!!lastWorkingConfig}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MCPConfigEditor;
