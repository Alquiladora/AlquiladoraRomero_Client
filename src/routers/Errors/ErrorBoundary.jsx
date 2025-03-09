import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        <AnimatePresence>
          <motion.div 
            className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-800 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-20 w-20 text-red-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor">
                <motion.path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15.232 5.232l3.536 3.536M4 13.5V20h6.5M14.121 9.879l3.536 3.536m-3.536-3.536a2 2 0 11-2.828-2.828l2.828 2.828zM9.879 14.121l-2.828 2.828a2 2 0 102.828-2.828z"
                  initial={{ rotate: -20 }}
                  animate={{ rotate: 20 }}
                  transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
                />
              </svg>
            </motion.div>
            <motion.h1 
              className="text-3xl font-bold mb-4 text-gray-800 dark:text-white"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Lo sentimos, ha ocurrido un error.
            </motion.h1>
            <motion.p 
              className="mb-4 text-center text-gray-700 dark:text-gray-300"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Estamos al tanto del problema y en breve lo solucionaremos.
            </motion.p>
            <motion.button
              onClick={this.handleReset}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              Intentar de Nuevo
            </motion.button>
          </motion.div>
        </AnimatePresence>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
