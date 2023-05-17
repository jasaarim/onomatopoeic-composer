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
})
