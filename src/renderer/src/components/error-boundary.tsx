import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="p-4 border-destructive/50 bg-destructive/5">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <h3 className="text-sm font-medium">Something went wrong</h3>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
