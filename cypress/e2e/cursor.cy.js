function mockPlayerForTime (player, times) {
  player._play = player.play
  player.play = () => {
    times.start = Date.now()
    player._play()
  }
  player._stop = player.stop
  player.stop = () => {
    times.end = Date.now()
    player._stop()
  }
}

describe('Cursor in the player', () => {
  it('Cursor from start to finish', () => {
    cy.visit('/')
    // Change the duration to 500 ms
    cy.get('#duration-input input').clear().type('0.46')
    cy.get('#duration-input input').should('have.value', '0.5')
    // Estimate how much time it takes for the cursor to travel across
    cy.get('audio-player').then((el) => {
      const player = el.get(0)
      const times = {}
      mockPlayerForTime(player, times)

      cy.get('audio-player #play-button').click()
      cy.get('player-controls').find('.active-icon').should('be.visible')
      cy.get('player-controls').find('.default-icon').should('be.visible')
        .then(() => {
          expect(times.end - times.start).to.gt(350).and.to.lt(650)
        })
    })
  })

  it('Cursor from half-way to the end', () => {
    cy.visit('/')
    cy.get('#position-input input').should('have.value', '0.0')
    cy.get('#position-input input').clear().type('0.29')
    cy.get('#position-input input').should('have.value', '0.3')
    cy.url().should('include', 'position=0.3')
    cy.get('#track1').click()
    cy.get('#position-input input').should('have.value', '10.0')
    // Change the duration to 600 ms
    cy.get('#duration-input input').clear().type('0.6')
    cy.get('#duration-input input').should('have.value', '0.6')
    cy.get('#position-input input').should('have.value', '0.0')
    cy.url().should('include', 'position=0').then(url => {
      url = url.replace('position=0', 'position=0.3')
      cy.visit(url)
    })
    cy.get('#position-input input').should('have.value', '0.3')
    // Estimate how much time it takes for the cursor to travel across
    cy.get('audio-player').then((el) => {
      const player = el.get(0)
      const times = {}
      mockPlayerForTime(player, times)
      cy.get('player-controls').find('#play-button').click()
        .get('#play-button .default-icon').should('be.visible')
        .then(() => {
          expect(times.end - times.start).to.gt(150).and.to.lt(450)
        })
    })
  })
})
