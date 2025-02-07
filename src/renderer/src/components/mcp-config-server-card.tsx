import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Trash2, PlusCircle, MinusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/tooltip';
import { ServerConfig } from './mcp-config-editor-main.tsx';

interface ServerCardProps {
  serverName: string;
  serverConfig: ServerConfig;
  onUpdate: (serverName: string, config: ServerConfig) => void;
  onRemove: (serverName: string) => void;
}

interface EnvVarEntry {
  key: string;
  value: string;
}

const ServerCard: React.FC<ServerCardProps> = ({
  serverName, 
  serverConfig, 
  onUpdate, 
  onRemove 
}) => {
  const [showArgs, setShowArgs] = useState(false);
  const [showEnv, setShowEnv] = useState(false);

  // Convert env object to array for easier manipulation with proper null checks
  const [envVars, setEnvVars] = useState<EnvVarEntry[]>(() => {
    if (!serverConfig?.env) return [];
    return Object.entries(serverConfig.env || {}).map(([key, value]) => ({ key, value: value as string }));
  });

  // Ensure serverConfig has all required properties
  React.useEffect(() => {
    if (!serverConfig?.env) {
      onUpdate(serverName, {
        ...serverConfig,
        env: {},
        args: serverConfig?.args || []
      });
    }
  }, [serverConfig, serverName, onUpdate]);

  const handleCommandChange = (value: string) => {
    onUpdate(serverName, {
      ...serverConfig,
      command: value
    });
  };

  const handleArgChange = (index: number, value: string) => {
    const newArgs = [...serverConfig.args];
    newArgs[index] = value;
    onUpdate(serverName, {
      ...serverConfig,
      args: newArgs
    });
  };

  const addArg = () => {
    onUpdate(serverName, {
      ...serverConfig,
      args: [...serverConfig.args, '']
    });
  };

  const removeArg = (index: number) => {
    const newArgs = [...serverConfig.args];
    newArgs.splice(index, 1);
    onUpdate(serverName, {
      ...serverConfig,
      args: newArgs
    });
  };

  const handleEnvChange = (index: number, key: string, value: string) => {
    const newEnvVars = [...envVars];
    newEnvVars[index] = { key, value };
    setEnvVars(newEnvVars);
    
    // Debounce the config update to reduce frequent saves
    const timeoutId = setTimeout(() => {
      const newEnv = Object.fromEntries(
        newEnvVars
          .filter(entry => entry.key.trim() !== '')
          .map(({ key, value }) => [key.trim(), value])
      );
      
      onUpdate(serverName, {
        ...serverConfig,
        env: newEnv
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '' }]);
  };

  const removeEnvVar = (index: number) => {
    const newEnvVars = [...envVars];
    newEnvVars.splice(index, 1);
    
    // Convert back to object for server config
    const newEnv = Object.fromEntries(
      newEnvVars.map(({ key, value }) => [key, value])
    );
    
    onUpdate(serverName, {
      ...serverConfig,
      env: newEnv
    });
    setEnvVars(newEnvVars);
  };

  return (
    <TooltipProvider>
      <Card className="p-6 border">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">{serverName}</h3>
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => onRemove(serverName)}
                className="h-10 px-2 text-gray-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    role="button"
                    tabIndex={0}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ml-1"
                  >
                    <span className="text-gray-400">?</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Remove this server configuration</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Command (e.g., node, python, java)"
                value={serverConfig.command}
                onChange={(e) => handleCommandChange(e.target.value)}
                className="font-mono h-10"
              />
              <div className="flex-shrink-0">
                <Tooltip>
                  <TooltipTrigger>
                    <div 
                      role="button"
                      tabIndex={0}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <span className="text-gray-400">?</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>The command to run the MCP server (e.g., node, python, npx)</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowArgs(!showArgs)}
                  className="flex-1 justify-between h-10 font-normal"
                >
                  <span>Arguments ({serverConfig.args.length})</span>
                  {showArgs ? (
                    <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </Button>
                <Tooltip>
                  <TooltipTrigger>
                    <div 
                      role="button"
                      tabIndex={0}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ml-2"
                    >
                      <span className="text-gray-400">?</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Command line arguments passed to the server</TooltipContent>
                </Tooltip>
              </div>

              {showArgs && (
                <div className="space-y-2 pl-4">
                  {serverConfig.args.map((arg: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex gap-2 items-center flex-1" style={{ position: 'relative', zIndex: 5 }}>
                        <Input
                          value={arg}
                          onChange={(e) => handleArgChange(index, e.target.value)}
                          className="font-mono"
                          placeholder={`Argument ${index + 1}`}
                        />
                        <div className="flex-shrink-0">
                          <Tooltip>
                            <TooltipTrigger>
                              <div 
                                role="button"
                                tabIndex={0}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              >
                                <span className="text-gray-400">?</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Command line argument {index + 1}</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          onClick={() => removeArg(index)}
                          className="h-10 px-2 text-gray-500 hover:text-red-600"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </Button>
                        <Tooltip>
                          <TooltipTrigger>
                              <div 
                                role="button"
                                tabIndex={0}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ml-1"
                              >
                                <span className="text-gray-400">?</span>
                              </div>
                          </TooltipTrigger>
                          <TooltipContent>Remove this argument</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      onClick={addArg}
                      className="flex-1 h-10 font-normal"
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Argument
                    </Button>
                    <Tooltip>
                      <TooltipTrigger>
                      <div 
                        role="button"
                        tabIndex={0}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ml-2"
                      >
                        <span className="text-gray-400">?</span>
                      </div>
                      </TooltipTrigger>
                      <TooltipContent>Add a new command line argument</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowEnv(!showEnv)}
                  className="flex-1 justify-between h-10 font-normal"
                >
                  <span>Environment Variables ({envVars.length})</span>
                  {showEnv ? (
                    <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </Button>
                <Tooltip>
                  <TooltipTrigger>
                    <div 
                      role="button"
                      tabIndex={0}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ml-2"
                    >
                      <span className="text-gray-400">?</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Environment variables passed to the server process</TooltipContent>
                </Tooltip>
              </div>

              {showEnv && (
                <div className="space-y-2 pl-4">
                  {envVars.map((env, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex gap-2 items-center w-1/3" style={{ position: 'relative', zIndex: 10 }}>
                        <Input
                          value={env.key}
                          onChange={(e) => {
                            e.persist();
                            handleEnvChange(index, e.target.value, env.value);
                          }}
                          onKeyDown={(e) => e.stopPropagation()}
                          className="font-mono"
                          placeholder="KEY"
                          aria-label="Environment variable key"
                          tabIndex={0}
                          autoComplete="off"
                        />
                        <div className="flex-shrink-0">
                          <Tooltip>
                            <TooltipTrigger>
                              <div 
                                role="button"
                                tabIndex={0}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              >
                                <span className="text-gray-400">?</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Environment variable name (e.g., API_KEY)</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center flex-1">
                        <Input
                          value={env.value}
                          onChange={(e) => handleEnvChange(index, env.key, e.target.value)}
                          className="font-mono"
                          placeholder="value"
                          type="text"
                        />
                        <div className="flex-shrink-0">
                          <Tooltip>
                            <TooltipTrigger>
                              <div 
                                role="button"
                                tabIndex={0}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              >
                                <span className="text-gray-400">?</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Environment variable value</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          onClick={() => removeEnvVar(index)}
                          className="h-10 px-2 text-gray-500 hover:text-red-600"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </Button>
                        <Tooltip>
                          <TooltipTrigger>
                              <div 
                                role="button"
                                tabIndex={0}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ml-1"
                              >
                                <span className="text-gray-400">?</span>
                              </div>
                          </TooltipTrigger>
                          <TooltipContent>Remove this environment variable</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      onClick={addEnvVar}
                      className="flex-1 h-10 font-normal"
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Environment Variable
                    </Button>
                    <Tooltip>
                      <TooltipTrigger>
                          <div 
                            role="button"
                            tabIndex={0}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ml-2"
                          >
                            <span className="text-gray-400">?</span>
                          </div>
                      </TooltipTrigger>
                      <TooltipContent>Add a new environment variable key-value pair</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
};

export default ServerCard;
