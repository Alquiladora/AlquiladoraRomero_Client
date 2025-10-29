import React, { createContext, useContext } from 'react';
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3';

const ReCaptchaContext = createContext(null);

export const useReCaptcha = () => useContext(ReCaptchaContext);

export const ReCaptchaProvider = ({ children }) => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey="6Leoy8cqAAAAANFIwr6Jlu32QxWBzf6S9CUVy4gq">
      <ReCaptchaHandler>{children}</ReCaptchaHandler>
    </GoogleReCaptchaProvider>
  );
};

const ReCaptchaHandler = ({ children }) => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  if (!executeRecaptcha) {
    console.warn('⚠️ executeRecaptcha aún no está disponible.');
    console.log('⚠️ executeRecaptcha aún no está disponible.');
  }

  return (
    <ReCaptchaContext.Provider value={executeRecaptcha}>
      {children}
    </ReCaptchaContext.Provider>
  );
};
