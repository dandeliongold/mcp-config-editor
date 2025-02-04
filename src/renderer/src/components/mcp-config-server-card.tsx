import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Trash2, PlusCircle, MinusCircle, ChevronDown, ChevronUp } from 'lucide-react';
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
    <Card className="p-6 border">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{serverName}</h3>
          <Button
            variant="ghost"
            onClick={() => onRemove(serverName)}
            className="h-10 px-2 text-gray-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Input
              placeholder="Command (e.g., node, python, java)"
              value={serverConfig.command}
              onChange={(e) => handleCommandChange(e.target.value)}
              className="font-mono h-10"
            />
          </div>

          <div className="space-y-2">
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

            {showArgs && (
              <div className="space-y-2 pl-4">
                {serverConfig.args.map((arg: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={arg}
                      onChange={(e) => handleArgChange(index, e.target.value)}
                      className="font-mono"
                      placeholder={`Argument ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      onClick={() => removeArg(index)}
                      className="h-10 px-2 text-gray-500 hover:text-red-600"
                    >
                      <MinusCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addArg}
                  className="w-full h-10 font-normal"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Argument
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
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

            {showEnv && (
              <div className="space-y-2 pl-4">
                {envVars.map((env, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={env.key}
                      onChange={(e) => handleEnvChange(index, e.target.value, env.value)}
                      className="w-1/3 font-mono"
                      placeholder="KEY"
                    />
                    <Input
                      value={env.value}
                      onChange={(e) => handleEnvChange(index, env.key, e.target.value)}
                      className="flex-1 font-mono"
                      placeholder="value"
                      type="password"
                    />
                    <Button
                      variant="ghost"
                      onClick={() => removeEnvVar(index)}
                      className="h-10 px-2 text-gray-500 hover:text-red-600"
                    >
                      <MinusCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addEnvVar}
                  className="w-full h-10 font-normal"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Environment Variable
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ServerCard;
