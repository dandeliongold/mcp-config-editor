import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

interface LabelWithTooltipProps {
  text: string;
  tooltip: string;
}

export const LabelWithTooltip: React.FC<LabelWithTooltipProps> = ({ text, tooltip }) => (
  <div className="flex items-center gap-1">
    <span className="block text-sm font-bold text-gray-900">{text}</span>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span 
            role="button" 
            tabIndex={0}
            className="inline-flex items-center cursor-help"
          >
            <HelpCircle className="w-4 h-4 text-gray-500" />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="text-red-500 text-sm">{message}</div>
);
