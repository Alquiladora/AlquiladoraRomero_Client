// cypress/e2e/historial-pedido.cy.js
describe('Historial de Pedidos E2E', () => {
  beforeEach(() => {
    // --- Intercepts (SIN /api/usuarios/perfil) ---
    cy.log('Registering intercepts...');
    cy.intercept('GET', '**/api/get-csrf-token').as('getCSRF'); // Puede ser necesario si checkAuth o fetch se llaman accidentalmente
    cy.intercept('GET', '**/api/empresa/log*').as('getLogo');
    cy.intercept('GET', '**/api/pedidos/historial-pedidos*').as('getOrders');
    cy.intercept('GET', '**/api/pedidos/calificados').as('getRated');

    // --- PASO 1: Simular Login ANTES de visitar ---
    cy.log('Executing cy.loginAsCliente()...');
    cy.loginAsCliente(); // Define window.__CYPRESS_AUTH_FORCE__

    // --- PASO 2: Visitar la Página ---
    cy.log('Visiting /historial-pedidos...');
    cy.visit('/historial-pedidos');

    // --- PASO 3: Esperar Render Inicial (Título) ---
    // AuthProvider debería iniciar con isLoading=false gracias al helper
    cy.log('Looking for page title...');
    cy.get('[data-testid="page-title"]', { timeout: 20000 }) // Reducir timeout si carga rápido
        .should('be.visible')
        .and('contain.text', 'Mis Pedidos');
    cy.log('Page title found and visible.');

    // --- PASO 4: Esperar LLAMADAS DEL COMPONENTE ---
    cy.log('Waiting for component API calls @getOrders and @getRated...');
    cy.wait(['@getOrders', '@getRated'], { timeout: 25000 });
    cy.log('Component API calls awaited successfully.');

    // --- PASO 5: Esperar fin de carga visual ---
    cy.log('Waiting for loading skeletons to disappear...');
    cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
    cy.log('Loading skeletons disappeared.');
  });

  // --- Tus Tests (it blocks) ---
  // ... (igual que antes) ...
   it('muestra el título correctamente', () => { /* ... */ });
   it('muestra la tarjeta del pedido con el ID de rastreo', () => { /* ... */ });
   it('abre el modal de detalles al hacer clic en "Ver detalles"', () => { /* ... */ });
});