import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetView = () => {
    try {
      window.location.href = window.location.pathname;
    } catch {
      window.location.reload();
    }
  };

  private handleCleanAndReload = () => {
    try {
      const raw = localStorage.getItem('ecom_products');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const sanitized = parsed.filter((p: any) => p && typeof p === 'object' && p.id);
            localStorage.setItem('ecom_products', JSON.stringify(sanitized));
          }
        } catch {}
      }
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="bg-white border border-rose-200 rounded-2xl p-8 max-w-lg w-full text-center shadow-lg">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">
              A apărut o problemă la afișarea acestei secțiuni
            </h2>
            <p className="text-xs text-neutral-500 mb-6">
              Am protejat datele tale pentru a nu se pierde. Poți reîncărca secțiunea sau poți aplica o auto-reparare rapidă a datelor.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={this.handleResetView}
                className="px-4 py-2 bg-[#0f4a3c] hover:bg-[#0c3c31] text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reîncarcă aplicația</span>
              </button>
              <button
                onClick={this.handleCleanAndReload}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Curăță & Reîncarcă</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
