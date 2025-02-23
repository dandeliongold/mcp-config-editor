import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, FileJson, FolderOpen, BookOpen, Download } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/tooltip';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
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
  const [configPath, setConfigPath] = useState<string>('');
  const handleSave = useCallback(async () => {
    try {
      if (window.ipcRenderer) {
        await window.ipcRenderer.invoke('save-config', config);
      } else {
        console.log('Development mode: Config would be saved as:', config);
      }
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }, [config]);

  // Store menu handlers in a ref to maintain stable reference
  const menuHandlersRef = useRef({
    save: handleSave
  });

  // Update ref when handler changes
  useEffect(() => {
    menuHandlersRef.current = {
      save: handleSave
    };
  }, [handleSave]);

  // Expose state setters to window for menu actions
  useEffect(() => {
    (window as any)._mcpConfigEditor = {
      setConfigPath,
      setConfig
    };
  }, []);

  useEffect(() => {
    const loadInitialState = async () => {
      try {
        if (window.ipcRenderer) {
          console.log('Loading initial state...');
          const currentPath = await window.ipcRenderer.invoke('get-config-path');
          console.log('Current config path:', currentPath);
          setConfigPath(currentPath);
          
          const loadedConfig = await window.ipcRenderer.invoke('get-config');
          console.log('Loaded config:', loadedConfig);
          // Ensure empty configs are handled consistently
          setConfig({
            mcpServers: loadedConfig?.mcpServers || {}
          });
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

    loadInitialState();

    // Set up menu save handler
    if (window.ipcRenderer) {
      const saveHandler = () => menuHandlersRef.current.save();
      window.ipcRenderer.on('menu-save-config', saveHandler);

      // Cleanup listener on unmount
      return () => {
        window.ipcRenderer.off('menu-save-config', saveHandler);
      };
    }
  }, []); // No dependencies needed

  // State for tracking duplicate server errors
  const [duplicateError, setDuplicateError] = useState<{
    serverNames: string[];
  } | null>(null);

  // Clear duplicate error when server name changes
  useEffect(() => {
    if (duplicateError?.serverNames.length === 1 && duplicateError.serverNames[0] !== newServerName) {
      setDuplicateError(null);
    }
  }, [newServerName]);

  // Check for duplicate server when typing
  useEffect(() => {
    if (newServerName && config.mcpServers[newServerName]) {
      setDuplicateError({
        serverNames: [newServerName]
      });
    }
  }, [newServerName, config.mcpServers]);

  const addNewServer = () => {
    if (!newServerName) return;
    
    // Check if server name already exists (error will be shown via effect)
    if (config.mcpServers[newServerName]) {
      return;
    }
    setDuplicateError(null);

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
  };

  const handleServerUpdate = (serverName: string, newServerConfig: ServerConfig) => {
    setConfig(prev => ({
      ...prev,
      mcpServers: {
        ...prev.mcpServers,
        [serverName]: newServerConfig
      }
    }));
  };

  const handleServerRemove = (serverName: string) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const newServers = { ...prev.mcpServers };
      delete newServers[serverName];
      newConfig.mcpServers = newServers;
      return newConfig;
    });
  };

  const handleJsonImport = (importedConfig: MCPConfig) => {
    // Check for duplicate server names
    const duplicates = Object.keys(importedConfig?.mcpServers || {})
      .filter(name => config.mcpServers[name]);

    if (duplicates.length > 0) {
      setDuplicateError({
        serverNames: duplicates
      });
      return;
    }
    setDuplicateError(null);

    setConfig(prev => ({
      ...prev,
      mcpServers: {
        ...prev.mcpServers,
        ...(importedConfig?.mcpServers || {})
      }
    }));
    setShowJsonInput(false);
  };

  return (
    <TooltipProvider>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-end gap-4">
            <div className="flex-1 overflow-hidden">
              {configPath ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-gray-500 block truncate" title={configPath}>
                      {configPath}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Current MCP configuration file path</TooltipContent>
                </Tooltip>
              ) : (
                <span className="text-sm text-gray-500 block">
                  No config file found. Check the quickstart guide to get started →
                </span>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => window.open('https://modelcontextprotocol.io/quickstart/user', '_blank')}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Quickstart Guide
                </Button>
              </TooltipTrigger>
              <TooltipContent>View the MCP quickstart guide</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={async () => {
                    if (window.ipcRenderer) {
                      const newPath = await window.ipcRenderer.invoke('select-config-file');
                      if (newPath) {
                        const newConfig = await window.ipcRenderer.invoke('load-config-from-path', newPath);
                        if (newConfig) {
                          setConfigPath(newPath);
                          setConfig({
                            mcpServers: newConfig?.mcpServers || {}
                          });
                        }
                      }
                    }
                  }}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Select Config
                </Button>
              </TooltipTrigger>
              <TooltipContent>Choose a different MCP configuration file</TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Duplicate Servers Error */}
            {duplicateError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Cannot Add Server{duplicateError.serverNames.length > 1 ? 's' : ''}</AlertTitle>
                <AlertDescription>
                  {duplicateError.serverNames.length === 1 ? (
                    <>
                      A server named "{duplicateError.serverNames[0]}" already exists.
                      Please remove or rename the duplicate server first if you want to replace it.
                    </>
                  ) : (
                    <>
                      The following servers already exist:
                      <ul className="list-disc pl-4 mt-2">
                        {duplicateError.serverNames.map(name => (
                          <li key={name}>"{name}"</li>
                        ))}
                      </ul>
                      Please remove or rename any duplicate servers first if you want to replace them.
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Add New Server Controls */}
            {configPath && <div className="flex gap-2 items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    placeholder="New server name"
                    value={newServerName}
                    onChange={(e) => setNewServerName(e.target.value)}
                    className="flex-1"
                  />
                </TooltipTrigger>
                <TooltipContent>Enter a unique name for the new MCP server</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={addNewServer} 
                    variant="outline"
                    className="h-10"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Server
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add a new MCP server to this configuration</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => setShowJsonInput(!showJsonInput)} 
                    variant="outline"
                    className="h-10"
                  >
                    <FileJson className="w-4 h-4 mr-2" />
                    Import JSON
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Import server configurations from JSON.</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      if (window.ipcRenderer) {
                        window.ipcRenderer.invoke('export-config', config);
                      }
                    }}
                    variant="outline"
                    className="h-10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Config
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export current configuration to a JSON file</TooltipContent>
              </Tooltip>
            </div>}

            {/* JSON Import Section */}
            {showJsonInput && (
              <JsonImport
                onImport={handleJsonImport}
                onCancel={() => setShowJsonInput(false)}
              />
            )}

            {/* Save Controls (Above Server List) */}
            {configPath && (
              <SaveControls
                onSave={handleSave}
              />
            )}


            {/* Server List */}
            <div className="space-y-4">
              {!configPath ? (
                <div className="text-center py-8 text-gray-500">
                  Check the quickstart guide to learn how to set up your MCP configuration file.
                </div>
              ) : Object.keys(config.mcpServers).length > 0 ? (
                Object.entries(config.mcpServers)
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
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Add a server to get started, either by adding settings manually, or by clicking the Import JSON button and pasting the configuration JSON code.
                </div>
              )}
            </div>

            {/* Save Controls */}
            {configPath && config.mcpServers && Object.keys(config.mcpServers).length > 1 && (
              <SaveControls onSave={handleSave} />
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default MCPConfigEditor;
