import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import ThemeProvider from './hooks/ContextThem';
import { AuthProvider } from "./hooks/ContextAuth";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
     <AuthProvider>
    <ThemeProvider>
    <BrowserRouter>
    <App />
    </BrowserRouter>
    </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
