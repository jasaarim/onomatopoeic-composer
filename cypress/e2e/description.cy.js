describe('Sound descriptions', () => {
  it('Display description', () => {
    cy.visit('/')
    cy.get('sound-element').first().click()
    cy.get('description-display h3').then(el => {
      cy.get('sound-element span').first()
        .should('have.text',
          el.get(0).textContent.charAt(0).toLowerCase() +
                        el.get(0).textContent.slice(1))
    })
  })

  it('Play a sound', () => {
    cy.visit('/')
    cy.get('sound-element.with-audio').first().click()
    cy.get('description-display p')
    cy.get('description-display').find('.play-icon').should('be.visible')

    cy.get('description-display').find('button').click()
    cy.get('description-display').find('.pause-icon').should('be.visible')
    cy.get('description-display').find('.play-icon').should('not.be.visible')

    cy.get('sound-element.with-audio').last().click()
    cy.get('description-display').find('.play-icon').should('be.visible')
    cy.get('description-display').find('.pause-icon').should('not.be.visible')
  })
})
