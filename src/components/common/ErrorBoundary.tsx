import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[36px]">error</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Something went wrong</h2>
          <p className="text-sm text-on-surface-variant max-w-md mb-3 leading-relaxed">
            An unexpected error occurred while loading this view. You can reload the page or return to the marketplace.
          </p>
          {this.state.error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-mono text-red-800 max-w-lg overflow-x-auto text-left">
              <strong>Error Details:</strong> {this.state.error.message || String(this.state.error)}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary-container hover:text-primary transition-all shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Reload Page
            </button>
            <a
              href="/marketplace"
              className="px-5 py-2.5 bg-surface text-on-surface border border-outline-variant font-semibold rounded-xl text-sm hover:bg-surface-container transition-colors"
            >
              Return to Marketplace
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
