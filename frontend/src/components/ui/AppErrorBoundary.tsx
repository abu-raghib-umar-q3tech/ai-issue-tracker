import { Component, type ErrorInfo, type PropsWithChildren } from 'react';

interface AppErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends Component<PropsWithChildren, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return {
      hasError: true
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('AppErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <main className="auth-shell">
          <section className="auth-card space-y-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Unexpected Error</p>
            <h1 className="app-heading">Something went wrong</h1>
            <p className="text-sm text-slate-600">Please refresh the page and try again.</p>
            <button type="button" onClick={() => window.location.reload()} className="btn-primary mx-auto mt-2">
              Reload App
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export { AppErrorBoundary };
