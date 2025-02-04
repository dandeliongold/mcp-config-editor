import './App.css';
import MCPConfigEditor from './components/mcp-config-editor-main';
import mcpConfigLogo from '../../assets/mcp-config-brackets.svg';

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
        </div>
      </div>
    </div>
  );
}

export default App;
