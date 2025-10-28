// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    chromeWebSecurity: false,  // <--- CLAVE PARA COOKIES
    setupNodeEvents(on, config) {
      return config;
    },
  },
});