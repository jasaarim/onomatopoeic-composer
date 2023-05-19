class MockAudioCxt extends AudioContext {
  constructor () {
    super()
    this.panners = 0
    this.buffers = 0
  }

  createBufferSource () {
    const source = super.createBufferSource()
    return this.mockConnect(source)
  }

  createStereoPanner () {
    const panner = super.createStereoPanner()
    return this.mockConnect(panner, false)
  }

  mockConnect (node, buffer = true) {
    node._connect = node.connect
    node.connect = (target) => {
      (buffer) ? this.buffers++ : this.panners++
      return node._connect(target)
    }
    return node
  }
}

describe('Sounds integrate to Audio Context', () => {
  it('Sound graph', () => {
    cy.visit('/')
    cy.get('audio-player').then(el => {
      const player = el.get(0)
      player._audioCxt = new MockAudioCxt()
    }).then(() => {
      cy.get('sound-element.with-audio').first()
        .find('.add-button').click()
      cy.wait(50)
      cy.get('sound-element.with-audio').eq(1)
        .find('.add-button').click()
    })
    cy.get('#track1 active-sound').not('.setting-buffer')
    cy.get('#track2 active-sound').not('.setting-buffer')
      .then(() => {
        cy.get('audio-player').then(el => {
          const player = el.get(0)
          expect(player._audioCxt.buffers).to.eq(2)
          expect(player._audioCxt.panners).to.eq(2)
        })
      })
  })

  it('Audio start called with right parameters', () => {
    cy.visit('/')
    const delays = []
    const offsets = []
    cy.get('sound-element.with-audio .add-button').first().click()
    cy.get('#track1 active-sound').not('.setting-buffer')
    cy.get('body').type('{rightArrow}{rightArrow}')
    cy.get('#position-input input').should('have.value', '1.0')
    cy.get('sound-element.with-audio .add-button').first().click()
    cy.get('#track2 active-sound').not('.setting-buffer').click()
    // Click just to focus out of the active-sound
    cy.get('description-display h3').click()
    cy.get('body').type('{leftArrow}')
    cy.get('#position-input input').should('have.value', '0.5')
    cy.get('active-sound').not('.setting-buffer').each(el => {
      const sound = el.get(0)
      // Mock start
      sound.bufferSource._start = sound.bufferSource.start
      sound.bufferSource.start = (delay, offset) => {
        const audioCxt = sound.getAudioCxt()
        let d = delay - audioCxt.currentTime
        d = Math.round(d * 1000) / 1000
        const o = Math.round(offset * 1000) / 1000
        delays.push(d)
        offsets.push(o)
        sound.bufferSource._start(delay, offset)
      }
    }).then(() => {
      cy.get('#play-button').click()
      cy.get('#stop-button').click().then(() => {
        expect(delays).to.deep.eq([0, 0.5])
        expect(offsets).to.deep.eq([0.5, 0])
      })
    })
  })
})
