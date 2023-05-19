import { type AudioPlayer } from './audio-player'
import { type DescriptionDisplay } from './description-display'
import { type GeneralControls } from './general-controls'
import { type SoundMenu } from './sound-menu'

import { parseTemplate } from '../utils/general'
import { soundStateFromURL, playerStateFromURL } from '../utils/url'

import template from '../templates/onomatopoeic-composer.html'
import '../style/onomatopoeic-composer.css'

const nodes = parseTemplate(template)

export class OnomatopoeicComposer extends HTMLElement {
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
    /**
     * Move the player cursor with left and right arrow keys
     */
    if (
      ['ArrowRight', 'ArrowLeft'].includes(event.code) &&
        (event.target as HTMLElement).tagName !== 'INPUT'
    ) {
      event.preventDefault()
      if (this.audioPlayer.started == null) {
        let newStart = this.audioPlayer.position
        const step = this.audioPlayer.duration / 40
        if (event.code === 'ArrowRight') {
          newStart += step
        } else if (event.code === 'ArrowLeft') {
          newStart -= step
        }
        newStart = Math.max(0, newStart)
        newStart = Math.min(newStart, this.audioPlayer.duration - 0.1)
        this.audioPlayer.position = newStart
      }
    }
  }
}

customElements.define('onomatopoeic-composer', OnomatopoeicComposer)
