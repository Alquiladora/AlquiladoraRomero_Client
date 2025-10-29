// cypress/support/e2e.js
import './commands';

Cypress.on('uncaught:exception', (err) => {
  return false; // Ignora todos los errores no críticos
});