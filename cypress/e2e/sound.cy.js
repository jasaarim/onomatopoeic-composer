describe('Sound elements', () => {
  // FIXME: This test works only once in the test browser session.
  // Seems that the fetch is affected by some cache.
  it('Clicking on a sound fetches an audio file', () => {
    cy.intercept('/audio/*').as('audioRequest')
    cy.visit('/')
    cy.get('sound-element.with-audio').first().then($el => {
      expect($el.get(0).audio.preload).to.eq('none')
    })
    cy.get('sound-element.with-audio').first().click().then(($el) => {
      cy.wait('@audioRequest').then(({ request }) => {
        expect($el.get(0).audio.preload).to.eq('auto')
        expect(decodeURI(request.url)).to.include($el.get(0).soundName)
      })
    })
  })
})
