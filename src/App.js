import React, { useState, useEffect } from 'react';
import Routerss from './routers/Routers';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import SpinerCarga from './utils/SpinerCarga';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

//Funcion
function App() {
  const [cargando, setCargando] = useState(document.readyState !== 'complete');

  useEffect(() => {
    if (!cargando) return;
    const handleLoad = () => setCargando(false);
    window.addEventListener('load', handleLoad);

    return () => window.removeEventListener('load', handleLoad);
  }, [cargando]);

  return (
    <div className="dark:bg-gray-800 dark:text-white">
      {cargando ? (
        <SpinerCarga />
      ) : (
        <GoogleReCaptchaProvider
          reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
          language="es"
          scriptProps={{
            async: true,
            defer: true,
            appendTo: 'body',
          }}
        >
          <Routerss />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            limit={3}
          />
        </GoogleReCaptchaProvider>
      )}
    </div>
  );
}

export default App;
