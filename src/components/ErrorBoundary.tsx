import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
            <div className="text-center max-w-sm">
              <h1 className="text-2xl font-semibold mb-2 font-[family-name:var(--font-heading)]">
                Something went wrong
              </h1>
              <p className="text-muted-foreground text-sm mb-6">
                The app encountered an unexpected error. Please reload the page to continue.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground h-10 px-5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Reload page
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
