const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // Puerto confirmado
    specPattern: 'cypress/e2e/gamificacion_ruleta.cy.js', // Solo este archivo
    supportFile: false, // Sin archivo de soporte
  },
});