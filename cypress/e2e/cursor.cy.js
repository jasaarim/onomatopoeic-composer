describe('Cursor in the player', () => {
  it('Cursor from start to finish', () => {
    cy.visit('/')
    // Change the duration to 500 ms
    cy.get('#player').then($el => {
      $el.get(0).setDuration(0.5)
    })
    // Estimate how much time it takes for the cursor to travel across
    let startTime
    cy.get('#play-button').click()
      .then(() => {
        startTime = new Date()
      })
      .get('#play-button .play-icon').should('be.visible')
      .then(() => {
        const endTime = new Date()
        const elapsed = endTime - startTime
        expect(elapsed).to.gt(400).and.to.lt(600)
      })
  })

  it('Cursor from half-way to the end', () => {
    cy.visit('/')
    cy.get('#player').click()
    // Change the duration to 600 ms
    cy.get('#player').then($el => {
      $el.get(0).setDuration(0.6)
    })
    // Estimate how much time it takes for the cursor to travel across
    let startTime
    cy.get('#play-button').click()
      .then(() => {
        startTime = new Date()
      })
      .get('#play-button .play-icon').should('be.visible')
      .then(() => {
        const endTime = new Date()
        const elapsed = endTime - startTime
        expect(elapsed).to.gt(200).and.to.lt(400)
      })
  })
})
