import './App.css';
import MCPConfigEditor from './components/mcp-config-editor-main';
import mcpConfigLogo from '../../assets/mcp-config-brackets.svg';
import { Button } from './components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';
import { BugIcon } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-8">
            <img src={mcpConfigLogo} alt="MCP Config Editor Logo" className="w-8 h-8 relative top-[1px]" />
            <h1 className="text-2xl font-bold text-gray-900">
              MCP Configuration Editor
            </h1>
          </div>
          <MCPConfigEditor />
          <div className="mt-8 text-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => window.open('https://github.com/dandeliongold/mcp-config-editor/issues/new/choose', '_blank')}
                  >
                    <BugIcon className="h-4 w-4 mr-2" />
                    Report Issue
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Report an issue or request a feature</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
