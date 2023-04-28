import { SoundElement } from './sound-element.js'
import { funDummy, makeStyleNode } from './utils.js'

type SoundsJSON = Record<string, { description: string, audio?: string }>

interface SoundMenuParams {
  showDescription: (sound: SoundElement) => void
  descriptionPlay: (sound: SoundElement) => void
  addToPlayer: (sound: SoundElement) => void
}

export class SoundMenu extends HTMLElement {
  soundsFile: string = 'sounds.json'
  showDescription: (sound: SoundElement) => void = funDummy
  descriptionPlay: (sound: SoundElement) => void = funDummy
  addToPlayer: (sound: SoundElement) => void = funDummy
  sounds: SoundElement[]

  static fromParams (params: SoundMenuParams): SoundMenu {
    let soundMenu = new SoundMenu()
    soundMenu = Object.assign(soundMenu, params)
    return soundMenu
  }

  constructor () {
    super()
    this.sounds = []
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.append(makeStyleNode('sound-menu'))
    this.addSounds().catch((error) => { throw error })
    this.connectEvents()
  }

  connectEvents (): void {
    this.addEventListener('keydown', (event) => { this.keyboardInteraction(event) })
  }

  keyboardInteraction (event: KeyboardEvent): void {
    if (['Space', 'Enter', 'ArrowUp', 'ArrowDown'].includes(event.code)) {
      const sound = this.shadowRoot?.activeElement as SoundElement
      if (sound != null) {
        event.preventDefault()
        let index = this.sounds.indexOf(sound)
        if (event.code === 'Space') {
          this.descriptionPlay(sound)
        } else if (event.code === 'Enter') {
          sound.buttonCallback(sound)
        } else if (event.code === 'ArrowUp') {
          if (index === 0) {
            index = this.sounds.length
          }
          this.sounds[index - 1].focus()
        } else if (event.code === 'ArrowDown') {
          if (index === this.sounds.length - 1) {
            index = -1
          }
          this.sounds[index + 1].focus()
        }
      }
    }
  }

  async addSounds (): Promise<void> {
    this.classList.add('adding-first-sounds')
    const response = await fetch(this.soundsFile)
    const json = await response.json() as SoundsJSON
    let count = 0
    let frag = document.createDocumentFragment()
    for (const [soundName, { description, audio = undefined }] of Object.entries(json)) {
      const sound = SoundElement.fromParams({
        soundName,
        descriptionFile: description,
        audioFile: audio,
        buttonCallback: (sound) => { this.addToPlayer(sound) },
        showDescription: (sound) => { this.showDescription(sound) }
      })
      frag.append(sound)
      this.sounds.push(sound)
      // Add the first sounds to the menu
      if (count++ === 10) {
        this.shadowRoot?.append(frag)
        frag = document.createDocumentFragment()
        await this.waitForSoundStyles(sound)
        this.classList.remove('adding-first-sounds')
      }
    }
    this.shadowRoot?.append(frag)
  }

  async waitForSoundStyles (sound: SoundElement): Promise<void> {
    for (let i = 0; i < 10; i++) {
      await new Promise<void>((resolve) => { setTimeout(() => { resolve() }, 20) })
      if (window.getComputedStyle(sound).zIndex === '1') {
        return
      }
    }
  }
}

customElements.define('sound-menu', SoundMenu)
