describe('General functionality', () => {
  it('Fullscreen API works', () => {
    cy.visit('/')
    cy.get('#fullscreen-toggle .active-icon').should('not.be.visible')
    cy.get('#fullscreen-toggle .default-icon').should('be.visible')
    cy.get('#fullscreen-toggle').click()
    cy.get('#fullscreen-toggle .active-icon').should('be.visible')
    cy.get('#fullscreen-toggle .default-icon').should('not.be.visible')
    cy.get('#fullscreen-toggle').click()
    cy.get('#fullscreen-toggle .default-icon').should('be.visible')
    cy.get('#fullscreen-toggle .active-icon').should('not.be.visible')
  })

  it('Information button', () => {
    cy.visit('/')
    cy.get('#info-toggle .active-icon').should('not.be.visible')
    cy.get('#info-toggle .default-icon').should('be.visible')
    cy.get('#info-toggle').click()
    cy.contains('In this app').should('be.visible')
    cy.get('#info-toggle .default-icon').should('not.be.visible')
    cy.get('#info-toggle .active-icon').should('be.visible')
    cy.get('#info-toggle').click()
    cy.contains('In this app').should('not.be.visible')
  })
})
