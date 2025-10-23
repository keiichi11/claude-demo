/**
 * ErrorBoundary Component - Catches React errors
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-4">
              <AlertCircle className="h-16 w-16 text-red-600 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              エラーが発生しました
            </h1>
            <p className="text-gray-600 mb-6">
              予期しないエラーが発生しました。ページを再読み込みしてください。
            </p>
            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  エラー詳細
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="space-y-2">
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
                fullWidth
                leftIcon={<RefreshCw className="h-5 w-5" />}
              >
                ページを再読み込み
              </Button>
              <Button
                onClick={this.handleReset}
                variant="secondary"
                fullWidth
              >
                もう一度試す
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
