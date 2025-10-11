
import React, { Component, ErrorInfo, ReactNode } from 'react';
import Icon from './Icon';

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }
  
  private handleReset = () => {
      this.setState({ hasError: false, error: null });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-900/50 rounded-lg text-center border border-red-700">
            <Icon name="exclamation-triangle" className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-300">Sayfa yüklenemedi</h2>
            <p className="text-red-200 mt-2">Bu bölümde beklenmedik bir hata oluştu.</p>
            {this.state.error && (
                <details className="mt-4 text-left text-sm">
                    <summary className="cursor-pointer text-red-300 hover:text-white">Hata Detayları</summary>
                    <pre className="mt-2 p-2 bg-gray-900 rounded text-red-200 whitespace-pre-wrap">
                        {this.state.error.toString()}
                    </pre>
                </details>
            )}
            <button onClick={this.handleReset} className="btn btn-secondary mt-6">
                <Icon name="reset" className="icon"/>
                Yeniden Dene
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
