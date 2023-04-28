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
    }).then(() => {
      cy.get('audio-player').then(el => {
        const player = el.get(0)
        const graph = player.audioCxt.destination.src
        expect(graph).to.deep.eq([['panner', ['buffer']],
          ['panner', ['buffer']]])
      })
    })
  })

  it('Audio start called with right parameters', () => {
    cy.visit('/')
    const delays = []
    const offsets = []
    cy.get('sound-element.with-audio').first()
      .find('.add-button').click()
    cy.get('body').type('{rightArrow}{rightArrow}', { force: true })
    cy.get('sound-element.with-audio').first()
      .find('.add-button').click()
    cy.get('body').type('{leftArrow}', { force: true })
    cy.get('active-sound').not('.initializing').each(el => {
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
      cy.get('player-controls').find('#play-button').click()
      cy.get('player-controls').find('#stop-button').click().then(() => {
        expect(delays).to.deep.eq([0, 0.1])
        expect(offsets).to.deep.eq([0.1, 0])
      })
    })
  })
})
