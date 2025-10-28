Cypress.Commands.add('loginAsCliente', () => {
  cy.window({ log: false }).then((win) => {
    win.__CYPRESS_AUTH_FORCE__ = {
      isLoading: false,
      user: { 
        id: 1, 
        idUsuarios: 50, 
        nombre: 'Claudia', 
        tipo: 'Cliente',
        rol: 'cliente'  // <--- CLAVE
      },
      csrfToken: 'fake-c srf-token-123'
    };
  });
});