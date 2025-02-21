import React from 'react';
import { v4 as uuidv4 } from 'uuid';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorId: null, errorCode: null };
  }

  static getDerivedStateFromError(error) {
    
    const errorCode = error?.response?.status || error.status || 'N/A';
    const errorId = uuidv4();
    return { hasError: true, error, errorId, errorCode };
  }

  componentDidCatch(error, errorInfo) {
    
    console.error("Error capturado por ErrorBoundary:", {
      error,
      errorInfo,
      errorId: this.state.errorId,
      errorCode: this.state.errorCode,
    });
  }

  handleReset = () => {
   
    this.setState({ hasError: false, error: null, errorId: null, errorCode: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white p-4">
         
          <div className="mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 text-blue-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M4 13.5V20h6.5M14.121 9.879l3.536 3.536m-3.536-3.536a2 2 0 11-2.828-2.828l2.828 2.828zM9.879 14.121l-2.828 2.828a2 2 0 102.828-2.828z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">
            Lo sentimos, ha ocurrido un error.
          </h1>
          <p className="mb-4 text-center">
            Estamos al tanto del problema y en breve lo solucionaremos.
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Intentar de Nuevo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
