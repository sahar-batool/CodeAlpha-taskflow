import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-slate-500">An unexpected error occurred. Please reload the page.</p>
        <button onClick={() => window.location.reload()} className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-[#fff] hover:bg-brand-700">
          Reload
        </button>
      </div>
    );
  }
}