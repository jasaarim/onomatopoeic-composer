class MockAudioCxt extends AudioContext {
  createBufferSource () {
    const source = super.createBufferSource()
    source.src = ['buffer']
    return MockAudioCxt.mockConnect(source)
  }

  createStereoPanner () {
    const panner = super.createStereoPanner()
    panner.src = ['panner']
    return MockAudioCxt.mockConnect(panner)
  }

  static mockConnect (node) {
    node._connect = node.connect
    node.connect = (target) => {
      if (!target.src) {
        target.src = [node.src]
      } else {
        target.src.push(node.src)
      }
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
        .find('.add-button').click().click()
    })
    cy.get('#track1 active-sound')
    cy.get('#track2 active-sound')
    cy.get('audio-player').then(el => {
      const player = el.get(0)
      const graph = player.audioCxt.destination.src
      expect(graph).to.deep.eq([['panner', ['buffer']],
        ['panner', ['buffer']]])
    })
  })

  it('Audio start called with right parameters', () => {
    cy.visit('/')
    const delays = []
    const offsets = []
    cy.get('sound-element.with-audio .add-button').first().click()
    cy.get('#track1 active-sound').not('.setting-buffer')
    cy.get('body').type('{rightArrow}{rightArrow}')
    cy.get('audio-player').contains('0.2 s')
    cy.get('sound-element.with-audio .add-button').first().click()
    cy.get('#track2 active-sound').not('.setting-buffer').click()
    // Click just to focus out of the active-sound
    cy.get('description-display h3').click()
    cy.get('body').type('{leftArrow}')
    cy.get('audio-player').contains('0.1 s')
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
        expect(delays).to.deep.eq([0, 0.1])
        expect(offsets).to.deep.eq([0.1, 0])
      })
    })
  })
})
