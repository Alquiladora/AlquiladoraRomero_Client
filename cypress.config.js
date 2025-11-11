// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://alquiladora-romero-server.onrender.com',
    chromeWebSecurity: false, 
    setupNodeEvents(on, config) {
      return config;
    },
  },
});