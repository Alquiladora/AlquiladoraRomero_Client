import React from "react";
import Routerss from "./routers/Routers";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

import ErrorBoundary from "./errors/ErrorBoundary";

function App() {
  return (
    <div>
    
        <ErrorBoundary>
          <GoogleReCaptchaProvider reCaptchaKey="6Leoy8cqAAAAANFIwr6Jlu32QxWBzf6S9CUVy4gq">
            <Routerss />
          </GoogleReCaptchaProvider>
        </ErrorBoundary>
     
    </div>
  );
}

export default App;
