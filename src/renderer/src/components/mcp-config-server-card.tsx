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
    
    // Convert back to object for server config with validation
    const newEnv = Object.fromEntries(
      newEnvVars
        .filter(entry => entry.key.trim() !== '') // Only include entries with non-empty keys
        .map(({ key, value }) => [key.trim(), value])
    );
    
    onUpdate(serverName, {
      ...serverConfig,
      env: newEnv
    });
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => onRemove(serverName)}
                  className="h-10 px-2 text-gray-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove this server configuration</TooltipContent>
            </Tooltip>
          </div>

          <div className="space-y-4">
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    placeholder="Command (e.g., node, python, java)"
                    value={serverConfig.command}
                    onChange={(e) => handleCommandChange(e.target.value)}
                    className="font-mono h-10"
                  />
                </TooltipTrigger>
                <TooltipContent>The command to run the MCP server (e.g., node, python, npx)</TooltipContent>
              </Tooltip>
            </div>

            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setShowArgs(!showArgs)}
                    className="w-full justify-between h-10 font-normal"
                  >
                    <span>Arguments ({serverConfig.args.length})</span>
                    {showArgs ? (
                      <ChevronUp className="w-4 h-4 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-2" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Command line arguments passed to the server</TooltipContent>
              </Tooltip>

              {showArgs && (
                <div className="space-y-2 pl-4">
                  {serverConfig.args.map((arg: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Input
                            value={arg}
                            onChange={(e) => handleArgChange(index, e.target.value)}
                            className="font-mono"
                            placeholder={`Argument ${index + 1}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>Command line argument {index + 1}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            onClick={() => removeArg(index)}
                            className="h-10 px-2 text-gray-500 hover:text-red-600"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove this argument</TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={addArg}
                        className="w-full h-10 font-normal"
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Argument
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add a new command line argument</TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setShowEnv(!showEnv)}
                    className="w-full justify-between h-10 font-normal"
                  >
                    <span>Environment Variables ({envVars.length})</span>
                    {showEnv ? (
                      <ChevronUp className="w-4 h-4 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-2" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Environment variables passed to the server process</TooltipContent>
              </Tooltip>

              {showEnv && (
                <div className="space-y-2 pl-4">
                  {envVars.map((env, index) => (
                    <div key={index} className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Input
                            value={env.key}
                            onChange={(e) => handleEnvChange(index, e.target.value, env.value)}
                            className="w-1/3 font-mono"
                            placeholder="KEY"
                          />
                        </TooltipTrigger>
                        <TooltipContent>Environment variable name (e.g., API_KEY)</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Input
                            value={env.value}
                            onChange={(e) => handleEnvChange(index, env.key, e.target.value)}
                            className="flex-1 font-mono"
                            placeholder="value"
                            type="password"
                          />
                        </TooltipTrigger>
                        <TooltipContent>Environment variable value (hidden for security)</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            onClick={() => removeEnvVar(index)}
                            className="h-10 px-2 text-gray-500 hover:text-red-600"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove this environment variable</TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={addEnvVar}
                        className="w-full h-10 font-normal"
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Environment Variable
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add a new environment variable key-value pair</TooltipContent>
                  </Tooltip>
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
