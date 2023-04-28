import { createShadow, funDummy } from './utils.js'
import dragScrollOrClick from '../events/drag-and-drop.js'

interface SoundParams {
  soundName: string
  descriptionFile: string
  audioFile?: string
  buttonCallback: (sound: SoundElement) => void
  showDescription: (sound: SoundElement) => void
}

export class SoundElement extends HTMLElement {
  soundName: string
  descriptionFile: string
  audioFile?: string
  buttonCallback: (sound: SoundElement) => void = funDummy
  showDescription: (sound: SoundElement) => void = funDummy
  width?: number // Width on the player, set the first time the sound enters a track
  connect: () => void
  connected: Promise<void>
  audio: HTMLAudioElement = document.createElement('audio')
  addButton: HTMLButtonElement = document.createElement('button')

  static fromParams (params: SoundParams): SoundElement {
    let soundElement = new SoundElement()
    soundElement = Object.assign(soundElement, params)
    soundElement.initialize()
    return soundElement
  }

  constructor () {
    super()
    createShadow('sound-element', this, () => { this.connectEvents() })
    this.soundName = ''
    this.descriptionFile = ''
    this.connect = () => { throw new Error('Impossible!') }
    this.connected = new Promise(resolve => {
      this.connect = resolve
    })
    this.tabIndex = 0
    this.setAttribute('tabindex', '0')
  }

  initialize (): void {
    this.classList.add('initializing')
    this.append(this.soundName)
    this.id = `sound-${this.soundName}`.replace('ä', 'a').replace('ö', 'o')
    this.connected
      .then(() => {
        this.connectAudio()
        this.classList.remove('initializing')
      })
      .catch((error) => { throw error })
  }

  connectEvents (): void {
    this.addButton = this.shadowRoot?.querySelector('button') as HTMLButtonElement
    this.addButton.addEventListener('pointerdown', (event) => {
      event.stopPropagation()
      this.buttonCallback(this)
    })

    this.addEventListener('focus', () => { this.showDescription(this) })
    if (this.audioFile != null) {
      this.addEventListener('pointerdown', (event) => {
        dragScrollOrClick(event, this)
      }, { passive: true })
    }
    this.connect()
  }

  connectAudio (): void {
    const audio = this.shadowRoot?.querySelector('audio') as HTMLAudioElement
    this.audio = audio
    if (this.audioFile != null) {
      this.audio.src = this.audioFile
      this.classList.add('with-audio')
    } else {
      this.classList.add('no-audio')
      this.addButton.disabled = true
    }
  }
}

customElements.define('sound-element', SoundElement)
