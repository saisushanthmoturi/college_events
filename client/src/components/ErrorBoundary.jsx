import React from 'react';
import { Container, Button } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container className="py-5 text-center d-flex flex-column align-items-center justify-content-center min-vh-100">
          <h1 className="display-4 fw-bold text-danger mb-4">Oops! Something went wrong.</h1>
          <p className="text-secondary mb-4">We encountered an unexpected error. Please try refreshing or go back to the home page.</p>
          <div className="bg-dark bg-opacity-50 p-3 rounded mb-4 text-start text-warning font-monospace small w-75 overflow-auto">
            {this.state.error?.toString()}
          </div>
          <Button variant="primary" onClick={() => window.location.href = '/'}>
            Go Back Home
          </Button>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
