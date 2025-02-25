import React, { useState, useEffect } from "react";
import Routerss from "./routers/Routers";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import SpinerCarga from "./utils/SpinerCarga";
import { ServerStatusProvider } from './utils/ServerStatusContext';
import { ToastContainer } from "react-toastify";




function App() {
  const [cargando, setCargando] = useState(document.readyState !== "complete");
  
  useEffect(() => {
    if (!cargando) return;
    const handleLoad = () => setCargando(false);
    window.addEventListener("load", handleLoad);

    return () => window.removeEventListener("load", handleLoad);
  }, [cargando]);
 
  return (
    <div className="dark:bg-gray-800 dark:text-white">
    
        <ServerStatusProvider>
      {cargando ? (
        <SpinerCarga />
      ) : (
        <GoogleReCaptchaProvider reCaptchaKey="6Leoy8cqAAAAANFIwr6Jlu32QxWBzf6S9CUVy4gq">
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
            />

        </GoogleReCaptchaProvider>
      )}
    </ServerStatusProvider>
    </div>
    
  );
}

export default App;
