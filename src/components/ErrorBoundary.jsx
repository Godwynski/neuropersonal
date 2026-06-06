import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-[#0a0a0a] font-inter p-8">
          <div className="border border-[#262626] bg-[#0a0a0a] p-8 rounded-lg shadow-lg max-w-md text-center space-y-4">
            <div className="text-4xl">💥</div>
            <h1 className="text-xl font-bold font-outfit text-gray-200">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-400">
              An unexpected error occurred. Your system settings have not been modified.
            </p>
            <pre className="text-left text-[10px] bg-[#141414] p-3 border border-[#262626] rounded-lg font-mono overflow-auto max-h-32 text-[#ff4655]">
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
              }}
              className="px-6 py-2 bg-[#3b82f6] text-white border border-[#262626] rounded-lg font-bold font-outfit cursor-pointer shadow-md hover:shadow-sm active:scale-95 transition-all"
            >
              Try to Recover
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
