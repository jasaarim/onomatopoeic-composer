import { parseTemplate } from './elements/utils'

import './elements/audio-player'
import './elements/description-display'
import './elements/sound-menu'
import { type SoundMenu } from './elements/sound-menu'
import { type SoundEntry, type SoundState, type AudioPlayer } from './elements/audio-player'
import { type DescriptionDisplay } from './elements/description-display'

import template from './templates/app.html'
import './style/app.css'

const nodes = parseTemplate(template)

export class App extends HTMLElement {
  descriptionDisplay?: DescriptionDisplay
  soundMenu: SoundMenu
  audioPlayer: AudioPlayer

  constructor () {
    super()
    this.appendChild(nodes.cloneNode(true))
    this.descriptionDisplay = this.querySelector('description-display') as DescriptionDisplay
    this.audioPlayer = this.querySelector('audio-player') as AudioPlayer
    this.audioPlayer.initialize({
      addSoundToURL: App.addSoundToURL,
      removeSoundFromURL: App.removeSoundFromURL,
      findSound: (soundName) => this.soundMenu.sounds[soundName]
    })
    this.soundMenu = this.querySelector('sound-menu') as SoundMenu
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
    this.soundMenu.soundsAdded
      .then(() => {
        this.audioPlayer.loadState(soundStateFromURL())
      })
      .catch((error) => { throw error })
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
          if (newStart >= -1e-10) {
            this.audioPlayer.start = newStart
          }
        }
      }
    }
  }

  static addSoundToURL (refNum: number, soundEntry: SoundEntry): void {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set(`sound${refNum}`, soundEntry.soundName)
    searchParams.set(`track${refNum}`, `${soundEntry.trackNum}`)
    searchParams.set(`start${refNum}`, `${soundEntry.start}`)
    const newURL = window.location.pathname + '?' + searchParams.toString()
    history.replaceState(null, '', newURL)
  }

  static removeSoundFromURL (refNum: number): void {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.delete(`sound${refNum}`)
    searchParams.delete(`track${refNum}`)
    searchParams.delete(`start${refNum}`)
    const newURL = window.location.pathname + '?' + searchParams.toString()
    history.replaceState(null, '', newURL)
  }
}

function soundStateFromURL (): SoundState {
  const searchParams = new URLSearchParams(window.location.search)
  const soundState = new Map()
  for (const [key, value] of searchParams.entries()) {
    let refNum
    let paramName
    let paramValue
    refNum = key.split('sound')[1]
    if (refNum != null) {
      paramName = 'soundName'
      paramValue = value
    } else {
      refNum = key.split('track')[1]
      if (refNum != null) {
        paramName = 'trackNum'
        paramValue = Number(value)
      } else {
        refNum = key.split('start')[1]
        paramName = 'start'
        paramValue = Number(value)
      }
    }
    if (refNum != null) {
      refNum = Number(refNum)
      if (soundState.get(refNum) != null) {
        soundState.get(refNum)[paramName] = paramValue
      } else {
        const state: Record<string, number | string> = {}
        state[paramName] = paramValue
        soundState.set(refNum, state)
      }
    }
  }
  return soundState
}

customElements.define('app-', App)
