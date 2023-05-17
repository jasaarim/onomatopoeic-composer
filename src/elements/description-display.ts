import { type SoundElement } from './sound-element'
import { parseTemplate } from './utils'

import template from '../templates/description-display.html'
import '../style/description-display.css'

const nodes = parseTemplate(template)

export class DescriptionDisplay extends HTMLElement {
  playButton: HTMLButtonElement = document.createElement('button')
  soundName?: string
  text?: HTMLElement[]
  audio?: HTMLAudioElement

  constructor () {
    super()
    this.appendChild(nodes.cloneNode(true))
    this.playButton = this.querySelector('button') as HTMLButtonElement
    this.playButton.addEventListener('click', () => { this.play() })
  }

  show (sound: SoundElement): void {
    if (this.soundName !== sound.soundName) {
      fetch(sound.descriptionFile)
        .then(async response => await response.text())
        .then(text => { this.prepareContent(sound, text) })
        .catch(error => { throw error })
    }
  }

  prepareContent (sound: SoundElement, text: string): void {
    this.clear()
    this.soundName = sound.soundName
    const h = document.createElement('h3')
    h.append(sound.soundName.charAt(0).toUpperCase() +
      sound.soundName.slice(1))
    const p = document.createElement('p')
    p.append(text)
    this.text = [h, p]
    this.appendChild(h)
    this.appendChild(p)
    if (sound.audioFile != null) {
      this.audio = sound.audio
      this.audio.preload = 'auto'
      this.audio.onended = () => { this.playButton.removeAttribute('active') }
      this.setAttribute('audio', '')
    }
  }

  clear (): void {
    delete this.soundName
    if (this.text != null) {
      for (const elem of this.text) {
        elem.remove()
      }
      delete this.text
    }
    if (this.playButton.classList.contains('active')) {
      this.pause()
      if (this.audio == null) {
        throw new Error('description audio null at clear')
      }
      this.audio.currentTime = 0
    }
    if (this.audio != null) {
      this.audio.onended = null
      delete this.audio
      this.removeAttribute('audio')
    }
  }

  play (): void {
    if (!this.playButton.classList.contains('active')) {
      if (this.audio == null) {
        throw new Error('description audio null at play')
      }
      this.audio.play().catch(error => { throw error })
      this.audio.onended = () => { this.pause() }
      this.playButton.classList.add('active')
    } else {
      this.pause()
    }
  }

  pause (): void {
    if (this.audio == null) {
      throw new Error('description audio null at pause')
    }
    this.audio.pause()
    this.playButton.classList.remove('active')
  }
}

customElements.define('description-display', DescriptionDisplay)
