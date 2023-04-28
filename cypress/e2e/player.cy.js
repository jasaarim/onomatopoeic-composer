describe('Moving sounds', () => {
  it('Adding sounds from menu to the player', () => {
    cy.visit('/')
    cy.get('sound-element.no-audio').first()
      .find('.add-button').should('be.disabled')
    cy.get('sound-element.with-audio').first().find('.add-button').click()
    cy.get('body').click().type('{rightArrow}')
    for (let i = 0; i < 8; i++) {
      cy.get('sound-element.with-audio').first().find('.add-button').click()
      cy.wait(10)
    }
    cy.get('audio-player').find('active-sound')
      .should($sounds => expect($sounds.length).to.eq(9))
    cy.get('#track1').find('active-sound')
      .should($sounds => expect($sounds.length).to.eq(2))
    cy.get('#track3').find('active-sound').then($el => {
      expect(Math.round($el.get(0).position * 1000) / 1000).to.eq(0.5)
    })
  })

  it('Adding a sound to the end', () => {
    let arrows = ''
    for (let i = 0; i < 99; i++) { arrows += '{rightArrow}' }
    cy.visit('/')
    cy.get('#track1').click()
    cy.get('audio-player').contains('10.0 s')
    cy.get('body').click().type(arrows).click()
    cy.get('audio-player').contains('19.9 s')
    cy.get('sound-element.with-audio').first()
      .find('.add-button').click()
    cy.get('active-sound').not('.setting-buffer').then(el => {
      let expected = el.get(0).bufferSource.buffer.duration + 19.9
      expected = Math.round(expected * 100) / 100
      cy.get('audio-player').then(el2 => {
        expect(Math.round(el2.get(0).duration * 100) / 100)
          .to.eq(expected)
      })
    })
  })

  // This worked before the web components
  it.skip('Adding and moving sounds by dragging', () => {
    cy.visit('/')
    cy.get('audio-player').contains('0.0 s')
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
          .trigger('pointerdown', { pointerId: 1, force: true })
          .wait(350)
          .trigger('pointermove', {
            pageX: Math.round(targetX) + 200,
            pageY: Math.round(targetY),
            force: true
          })
          .trigger('pointerup', {
            pageX: Math.round(targetX) + 200,
            pageY: Math.round(targetY),
            force: true
          })

        cy.get('sound-element.with-audio').first()
          .trigger('pointerdown', { pointerId: 1, force: true })
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
          .trigger('pointerdown', { pointerId: 1, force: true })
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
})
