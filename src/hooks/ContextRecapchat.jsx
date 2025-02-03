import React, { createContext, useContext } from "react";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

// 🔹 Crear el contexto
const ReCaptchaContext = createContext(null);

// 🔹 Custom hook para acceder al contexto
export const useReCaptcha = () => useContext(ReCaptchaContext);

// 🔹 Proveedor de reCAPTCHA
export const ReCaptchaProvider = ({ children }) => {
    return (
        <GoogleReCaptchaProvider reCaptchaKey="6Leoy8cqAAAAANFIwr6Jlu32QxWBzf6S9CUVy4gq">
            <ReCaptchaHandler>{children}</ReCaptchaHandler>
        </GoogleReCaptchaProvider>
    );
};

// 🔹 Componente interno para manejar `executeRecaptcha`
const ReCaptchaHandler = ({ children }) => {
    const { executeRecaptcha } = useGoogleReCaptcha();

    // Evitar pasar undefined al contexto
    if (!executeRecaptcha) {
        console.warn("⚠️ executeRecaptcha aún no está disponible.");
        console.log("⚠️ executeRecaptcha aún no está disponible.");
        
    }

    return (
        <ReCaptchaContext.Provider value={executeRecaptcha}>
            {children}
        </ReCaptchaContext.Provider>
    );
};
