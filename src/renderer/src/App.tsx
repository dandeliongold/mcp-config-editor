import './App.css';
import MCPConfigEditor from './components/mcp-config-editor-main';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            MCP Configuration Editor
          </h1>
          <MCPConfigEditor />
        </div>
      </div>
    </div>
  );
}

export default App;
