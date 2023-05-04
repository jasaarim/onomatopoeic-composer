import { parseTemplate, funDummy } from './utils'
import dragScrollOrClick from '../events/drag-and-drop'

import template from '../templates/sound-element.html'
import '../style/sound-element.css'

const nodes = parseTemplate(template)

interface SoundParams {
  soundName: string
  descriptionFile: string
  audioFile?: string
  buttonCallback: (sound: SoundElement) => void
  showDescription: (sound: SoundElement) => void
}

export class SoundElement extends HTMLElement {
  soundName: string = ''
  descriptionFile: string = ''
  audioFile?: string
  buttonCallback: (sound: SoundElement) => void = funDummy
  showDescription: (sound: SoundElement) => void = funDummy
  width?: number // Width on the player, set the first time the sound enters a track
  audio: HTMLAudioElement
  addButton: HTMLButtonElement

  constructor () {
    super()
    // When we clone the sound, this will be run again even though the child exists
    if (this.children.length === 0) {
      this.appendChild(nodes.cloneNode(true))
    }
    this.addButton = this.querySelector('button') as HTMLButtonElement
    this.audio = this.querySelector('audio') as HTMLAudioElement
    this.tabIndex = 0
  }

  initialize (params: SoundParams): void {
    this.classList.add('initializing')

    this.soundName = params.soundName
    this.descriptionFile = params.descriptionFile
    this.audioFile = params.audioFile
    this.buttonCallback = params.buttonCallback
    this.showDescription = params.showDescription

    const span = document.createElement('span')
    span.append(this.soundName)
    this.append(span)
    this.id = `sound-${this.soundName}`.replace('ä', 'a').replace('ö', 'o')
    this.connectAudio()
    this.connectEvents()
    this.classList.remove('initializing')
  }

  connectEvents (): void {
    this.addButton.addEventListener('pointerdown', (event) => {
      event.stopPropagation()
      this.buttonCallback(this)
    })

    this.addEventListener('focus', () => { this.showDescription(this) })
    if (this.audioFile != null) {
      this.addEventListener('pointerdown', (event) => {
        if (event.pointerType !== 'mouse' || event.button === 0) {
          dragScrollOrClick(event, this)
        }
      }, { passive: true })
    }
  }

  connectAudio (): void {
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
