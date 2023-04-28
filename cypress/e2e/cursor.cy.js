describe('Cursor in the player', () => {
  it('Cursor from start to finish', () => {
    cy.visit('/')
    // Change the duration to 500 ms
    cy.get('audio-player').then(el => {
      el.get(0).setDuration(0.5)
    })
    cy.get('player-controls').contains('0.5 s')
    let startTime
    cy.get('player-controls').find('#play-button').click().then(() => {
      startTime = Date.now()
    })
      .find('.pause-icon').should('be.visible')
    cy.get('player-controls').find('.play-icon').should('be.visible')
      .then(() => {
        const endTime = Date.now()
        const elapsed = endTime - startTime
        // FIXME: measuring the time this way is unreliable and often this fails
        expect(elapsed).to.gt(400).and.to.lt(600)
      })
  })

  it('Cursor from half-way to the end', () => {
    cy.visit('/')
    cy.get('audio-player').click()
    cy.get('player-controls').contains('10.0 s')
    // Change the duration to 600 ms
    cy.get('audio-player').then(el => {
      el.get(0).setDuration(0.6)
    })
    cy.get('player-controls').contains('0.3 s')
    // Estimate how much time it takes for the cursor to travel across
    let startTime
    cy.get('player-controls').find('#play-button').click()
      .then(() => {
        startTime = new Date()
      })
      .get('#play-button .play-icon').should('be.visible')
      .then(() => {
        const endTime = new Date()
        const elapsed = endTime - startTime
        // FIXME: measuring the time this way is unreliable and often this fails
        expect(elapsed).to.gt(200).and.to.lt(400)
      })
  })
})
