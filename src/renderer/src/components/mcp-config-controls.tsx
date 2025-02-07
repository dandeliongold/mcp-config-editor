import React from 'react';
import { Button } from '../components/ui/button';
import { Save } from 'lucide-react';

interface SaveControlsProps {
  onSave: () => void;
}

const SaveControls: React.FC<SaveControlsProps> = ({
  onSave
}) => {
  return (
    <div className="flex justify-end">
      <Button 
        onClick={onSave}
        className="h-10 font-normal"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Configuration
      </Button>
    </div>
  );
};

export default SaveControls;
