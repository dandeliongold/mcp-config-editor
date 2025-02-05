import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';

interface JsonImportProps {
  onImport: (config: any) => void;
  onCancel: () => void;
}

const JsonImport: React.FC<JsonImportProps> = ({ onImport, onCancel }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.mcpServers || typeof parsed.mcpServers !== 'object') {
        throw new Error('Invalid configuration format: missing mcpServers object');
      }
      onImport(parsed);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format');
    }
  };

  return (
    <Card className="p-6 border border-dashed">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Add servers using JSON:</h3>
          <Textarea
            placeholder="Paste {'mcpServers': {}} configuration JSON code here and it will be added to any existing configuration."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="font-mono text-sm min-h-[200px] resize-none"
          />
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="text-sm">
              {error}
              <Button variant="link" onClick={() => setError(null)} className="ml-2 h-auto p-0">
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} className="h-10 font-normal">
            Cancel
          </Button>
          <Button onClick={handleImport} className="h-10 font-normal">
            Import
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default JsonImport;
