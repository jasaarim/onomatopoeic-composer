import { parseTemplate } from './elements/utils'

import './elements/audio-player'
import './elements/description-display'
import './elements/sound-menu'
import './elements/number-input'
import './elements/general-controls'
import { type SoundMenu } from './elements/sound-menu'
import { type AudioPlayer } from './elements/audio-player'
import { type DescriptionDisplay } from './elements/description-display'
import { type GeneralControls } from './elements/general-controls'

import { soundStateFromURL, playerStateFromURL } from './elements/url-utils'

import template from './templates/app.html'
import './style/app.css'

const nodes = parseTemplate(template)

export class App extends HTMLElement {
  descriptionDisplay?: DescriptionDisplay
  soundMenu: SoundMenu
  audioPlayer: AudioPlayer
  controls: GeneralControls

  constructor () {
    super()
    this.appendChild(nodes.cloneNode(true))

    this.descriptionDisplay = this.querySelector('description-display') as DescriptionDisplay
    this.audioPlayer = this.querySelector('audio-player') as AudioPlayer
    this.soundMenu = this.querySelector('sound-menu') as SoundMenu
    this.controls = this.querySelector('general-controls') as GeneralControls

    this.audioPlayer.initialize({
      findSound: (soundName) => this.soundMenu.sounds[soundName]
    })
    this.soundMenu.initialize({
      showDescription: (sound) => { this.descriptionDisplay?.show(sound) },
      addToPlayer: (sound) => {
        if (sound.audioFile != null) {
          this.audioPlayer.soundToTrack(sound).catch((error) => { throw error })
        }
      },
      descriptionPlay: (sound) => {
        if (this.descriptionDisplay?.soundName === sound.soundName) {
          this.descriptionDisplay.play()
        }
      }
    })
    this.connectEvents()
    this.audioPlayer.loadPlayerState(playerStateFromURL())
    this.soundMenu.soundsAdded
      .then(() => {
        this.audioPlayer.loadSoundState(soundStateFromURL())
      })
      .catch((error) => { throw error })

    // To enable blurring input elements by clicking anywhere
    this.tabIndex = 0
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

    document.documentElement.style.setProperty('--vh', `${vh}px`)
    document.documentElement.style.setProperty('--vw', `${vw}px`)
  }

  keyboardInteraction (event: KeyboardEvent): void {
    if (
      ['ArrowRight', 'ArrowLeft'].includes(event.code) &&
        (event.target as HTMLElement).tagName !== 'INPUT'
    ) {
      event.preventDefault()
      if (this.audioPlayer.started == null) {
        if (event.code === 'ArrowRight') {
          const newStart = this.audioPlayer.position + 0.1
          if (newStart < this.audioPlayer.duration) {
            this.audioPlayer.position = newStart
          }
        }
        if (event.code === 'ArrowLeft') {
          const newStart = this.audioPlayer.position - 0.1
          if (newStart >= -1e-10) {
            this.audioPlayer.position = newStart
          }
        }
      }
    }
  }
}

customElements.define('app-', App)
