import React, { Component } from "react";
import { Link } from "react-router-dom";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error capturado en ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
          <h1 className="text-6xl font-bold text-red-600">500</h1>
          <p className="text-xl mt-4 text-gray-700">Error interno del servidor</p>
          <p className="text-gray-500 mt-2">Lo sentimos, algo salió mal.</p>
          <button
            onClick={this.handleReload}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Recargar Página
          </button>
          <Link to="/" className="mt-2 text-blue-500 underline">
            Volver al Inicio
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
