import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import ThemeProvider from './hooks/ContextThem';
import { AuthProvider } from "./hooks/ContextAuth";
import InactivityHandler from './hooks/ContexInactividad';





const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter basename="/">
     <AuthProvider>
     <InactivityHandler>
    <ThemeProvider>
    <App />  
    </ThemeProvider>
    </InactivityHandler>
    </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
