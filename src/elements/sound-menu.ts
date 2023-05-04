import { SoundElement } from './sound-element'
import { funDummy } from './utils'

import '../style/sound-menu.css'

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

  constructor () {
    super()
    this.sounds = []
    this.addSounds().catch((error) => { throw error })
    this.connectEvents()
  }

  initialize (params: SoundMenuParams): void {
    this.showDescription = params.showDescription
    this.addToPlayer = params.addToPlayer
    this.descriptionPlay = params.descriptionPlay
  }

  connectEvents (): void {
    this.addEventListener('keydown', (event) => { this.keyboardInteraction(event) })
  }

  keyboardInteraction (event: KeyboardEvent): void {
    if (['Space', 'Enter', 'ArrowUp', 'ArrowDown'].includes(event.code)) {
      const sound = event.target
      if (sound instanceof SoundElement) {
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
      const sound = new SoundElement()
      sound.initialize({
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
        this.append(frag)
        frag = document.createDocumentFragment()
        this.classList.remove('adding-first-sounds')
      }
    }
    this.append(frag)
  }
}

customElements.define('sound-menu', SoundMenu)
