// src/components/common/ErrorBoundary.jsx
import React from 'react';
import { Card } from './Card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Error caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <Card className="bg-secondary p-4">
            <h2 className="text-lg font-semibold text-primary mb-2">Something went wrong</h2>
            <p className="text-dark mb-4">We're having trouble loading this content.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Try Again
            </button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;