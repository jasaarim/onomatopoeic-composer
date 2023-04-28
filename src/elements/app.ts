import { createShadow, makeStyleNode } from './utils.js'

import './description-display.js'
import { AudioPlayer } from './audio-player.js'
import { SoundMenu } from './sound-menu.js'
import { type DescriptionDisplay } from './description-display.js'

export class App extends HTMLElement {
  descriptionDisplay?: DescriptionDisplay
  soundMenu?: SoundMenu
  audioPlayer: AudioPlayer = new AudioPlayer()

  constructor () {
    super()
    createShadow('app', this, () => {
      this.shadowRoot?.append(makeStyleNode('app'))
      this.descriptionDisplay = this.shadowRoot?.querySelector('description-display') as DescriptionDisplay
      this.audioPlayer = this.shadowRoot?.querySelector('audio-player') as AudioPlayer
      this.soundMenu = SoundMenu.fromParams({
        showDescription: (sound) => { this.descriptionDisplay?.show(sound) },
        addToPlayer: (sound) => {
          if (sound.audioFile != null) {
            this.audioPlayer?.soundToTrack(sound).catch((error) => { throw error })
          }
        },
        descriptionPlay: (sound) => {
          if (this.descriptionDisplay?.soundName === sound.soundName) {
            this.descriptionDisplay.play()
          }
        }
      })
      this.soundMenu.setAttribute('slot', 'sound-menu')
      this.append(this.soundMenu)
      this.connectEvents()
    })
  }

  connectEvents (): void {
    this.resizeVh()
    window.addEventListener('COMContentLoaded', () => { this.resizeVh() })
    window.addEventListener('resize', () => { this.resizeVh() })
    document.addEventListener('keydown', (event) => { this.keyboardInteraction(event) })
  }

  resizeVh (): void {
    // Due to the hiding/showing address bar in some mobile browsers
    // the vh unit is not consistent with the visible page size.  This should
    // fix it.
    let vh = window.innerHeight * 0.01
    vh = Math.min(vh, 7)
    let vw = window.innerWidth * 0.01
    vw = Math.min(vw, 15)

    this.style.setProperty('--vh', `${vh}px`)
    this.style.setProperty('--vw', `${vw}px`)
  }

  keyboardInteraction (event: KeyboardEvent): void {
    if (['ArrowRight', 'ArrowLeft'].includes(event.code)) {
      event.preventDefault()
      if (this.audioPlayer.started == null) {
        if (event.code === 'ArrowRight') {
          const newStart = this.audioPlayer.start + 0.1
          if (newStart < this.audioPlayer.duration) {
            this.audioPlayer.start = newStart
          }
        }
        if (event.code === 'ArrowLeft') {
          const newStart = this.audioPlayer.start - 0.1
          if (newStart >= 0) {
            this.audioPlayer.start = newStart
          }
        }
      }
    }
  }
}

customElements.define('app-', App)
