import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import ThemeProvider from './hooks/ContextThem';
import { AuthProvider } from './hooks/ContextAuth';
import InactivityHandler from './hooks/ContexInactividad';
import { useSocket } from './utils/Socket';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { register } from './serviceWorkerRegistration';

function SocketController() {
  useSocket();
  return null;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <AuthProvider>
        <SocketController />
        <InactivityHandler>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </InactivityHandler>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => console.log('SW registrado:', reg))
      .catch((err) => console.log('SW error:', err));
  });
}

register({
  onUpdate: (registration) => {
    const waitingWorker = registration.waiting;
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  },
});

serviceWorkerRegistration.register();
