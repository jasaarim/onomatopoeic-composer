describe('Moving sounds', () => {
  it('Adding sounds from menu to the player', () => {
    cy.visit('/')
    cy.get('sound-element.no-audio .add-button').should('be.disabled')
    cy.get('sound-element.with-audio .add-button').first().click()
    cy.get('#track1 active-sound').not('setting-buffer').should('have.css', 'left', '0px')
    cy.wait(50)
    cy.get('body').type('{rightArrow}')
    cy.get('#position-input input').should('have.value', '0.1')
    for (let i = 0; i < 8; i++) {
      cy.get('sound-element.with-audio .add-button').first().click()
      if (i < 7) {
        cy.get(`#track${i + 2} active-sound`).not('setting-buffer')
      }
      cy.wait(10)
    }
    cy.get('audio-player').find('active-sound')
      .should($sounds => expect($sounds.length).to.eq(9))
    cy.get('#track1 active-sound')
      .should($sounds => expect($sounds.length).to.eq(2))
    cy.get('#track3 active-sound').then($el => {
      expect(Math.round($el.get(0).position * 1000) / 1000).to.eq(0.5)
    })
  })

  it('Adding a sound to the end', () => {
    cy.visit('/')
    cy.get('#track1').click()
    cy.get('#position-input input').should('have.value', '10.0')
      .clear()
      .type('19.9')
    cy.url().should('include', 'position=19.9')
    cy.get('sound-element.with-audio').first()
      .find('.add-button').click()
    let expectedEnd
    cy.get('active-sound').not('.setting-buffer').then(el => {
      expectedEnd = el.get(0).bufferSource.buffer.duration + 19.9
    }).then(() => {
      cy.get('#duration-input input').should('have.value', `${expectedEnd.toFixed(1)}`)
      cy.url().should('include', `duration=${expectedEnd.toFixed(2)}`)
        .then(url => {
          url = url.replace(`duration=${expectedEnd.toFixed(2)}`, 'duration=23')
          cy.visit(url)
        })
    })
    cy.get('#duration-input input').should('have.value', '23.0')
  })

  it('Adding and moving sounds by dragging', () => {
    cy.visit('/')
    cy.get('#position-input input').should('have.value', '0.0')
    cy.get('#track1').contains('1')
    let targetY, targetX, targetY2
    cy.get('#track3').then(el => {
      targetY = el.get(0).getBoundingClientRect().top
      targetX = el.get(0).getBoundingClientRect().left
    })
    cy.get('#track4').then(el => {
      targetY2 = el.get(0).getBoundingClientRect().top
    })
      .then(() => {
        cy.get('sound-element.with-audio').first()
          .trigger('pointerdown', { pointerId: 1 })
          .wait(350)
          .trigger('pointermove', {
            pageX: Math.round(targetX) + 200,
            pageY: Math.round(targetY),
            force: true
          })
          .trigger('pointerup', {
            pageX: Math.round(targetX) + 200,
            pageY: Math.round(targetY)
          })

        cy.get('sound-element.with-audio').first()
          .trigger('pointerdown', { pointerId: 1 })
          .wait(350)
          .trigger('pointermove', {
            pageX: Math.round(targetX) + 200,
            pageY: Math.round(targetY),
            force: true
          })
          .trigger('pointerup', {
            pageX: Math.round(targetX) + 200,
            pageY: Math.round(targetY)
          })

        cy.get('active-sound').first()
          .trigger('pointerdown', { pointerId: 1 })
          .wait(350)
          .trigger('pointermove', {
            pageX: Math.round(targetX) + 200,
            pageY: Math.round(targetY2),
            force: true
          })
          .trigger('pointerup', {
            pageX: Math.round(targetX) + 200,
            pageY: Math.round(targetY2)
          })
      })
    cy.get('#track3').find('active-sound')
      .should($sounds => expect($sounds.length).to.eq(1))
    cy.get('#track4').find('active-sound')
      .should($sounds => expect($sounds.length).to.eq(1))
  })

  it('Sounds in the player show in the URL', () => {
    cy.visit('/')
    cy.get('#track1').click()
    cy.get('#position-input input').should('have.value', '10.0')
    cy.get('sound-element.with-audio .add-button').first().click()
    cy.wait(30)
    cy.get('sound-element.with-audio .add-button').first().click()
    cy.get('#track1 active-sound .add-button').click()
    cy.get('#track2 active-sound')
    cy.url().should('include', '&track1=2&start1=10').should('not.include', 'track0')
      .then(url => {
        url = url.replace('track1=2', 'track1=3')
        cy.visit(url)
      })
    cy.get('#track3 active-sound')
  })
})
