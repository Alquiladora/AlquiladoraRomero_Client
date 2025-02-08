import React from "react";
import Routerss from "./routers/Routers";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";




function App() {
  return (
    <div>
    
   
          <GoogleReCaptchaProvider reCaptchaKey="6Leoy8cqAAAAANFIwr6Jlu32QxWBzf6S9CUVy4gq">
            <Routerss />
          </GoogleReCaptchaProvider>
   
        
     
    </div>
  );
}

export default App;
