import React from 'react';
import { Button } from '../components/ui/button';
import { Save, Undo2 } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

interface SaveControlsProps {
  onSave: () => void;
  onUndo: () => void;
  showUndoAlert: boolean;
  hasBackup: boolean;
}

const SaveControls: React.FC<SaveControlsProps> = ({
  onSave,
  onUndo,
  showUndoAlert,
  hasBackup
}) => {
  return (
    <div className="space-y-2">
      <div className="flex gap-2 justify-end">
        {hasBackup && (
          <Button 
            onClick={onUndo} 
            variant="outline"
            className="h-10 font-normal"
          >
            <Undo2 className="w-4 h-4 mr-2" />
            Undo Changes
          </Button>
        )}
        <Button 
          onClick={onSave}
          className="h-10 font-normal"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Configuration
        </Button>
      </div>

      {showUndoAlert && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <AlertDescription className="text-sm">
            Configuration saved successfully. You can undo this change if needed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SaveControls;
