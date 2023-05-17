import { parseTemplate } from './utils'
import { type NumberInput } from './number-input'

import template from '../templates/player-controls.html'
import '../style/player-controls.css'

const nodes = parseTemplate(template)

export class PlayerControls extends HTMLElement {
  playButton: HTMLButtonElement
  stopButton: HTMLButtonElement
  _position: number = -1
  _duration: number = -1
  positionInput: NumberInput
  durationInput: NumberInput

  constructor () {
    super()
    this.appendChild(nodes.cloneNode(true))
    this.playButton = this.querySelector('#play-button') as HTMLButtonElement
    this.stopButton = this.querySelector('#stop-button') as HTMLButtonElement
    this.positionInput = this.querySelector('#position-input') as NumberInput
    this.durationInput = this.querySelector('#duration-input') as NumberInput

    this.connectEvents()
  }

  connectEvents (): void {
    this.playButton.addEventListener('click', () => { this.play() })
    this.stopButton.addEventListener('click', () => { this.stop() })
    this.positionInput.addEventListener('update', (event) => {
      this.dispatchUpdate(event, 'position')
    })
    this.durationInput.addEventListener('update', (event) => {
      this.dispatchUpdate(event, 'duration')
    })
  }

  dispatchUpdate (event: Event, kind: 'position' | 'duration'): void {
    // https://github.com/microsoft/TypeScript/issues/28357
    event = new CustomEvent(`${kind}Update`, { detail: (event as CustomEvent).detail })
    this.dispatchEvent(event)
  }

  play (emit: boolean = true): void {
    if (this.playButton.classList.contains('active')) {
      this.playButton.classList.remove('active')
      this.setInputsDisabled(false)
    } else {
      this.playButton.classList.add('active')
      this.setInputsDisabled(true)
    }
    if (emit) this.dispatchEvent(new CustomEvent('play'))
  }

  stop (emit: boolean = true): void {
    this.playButton.classList.remove('active')
    this.setInputsDisabled(false)
    if (emit) this.dispatchEvent(new CustomEvent('stop'))
  }

  setInputsDisabled (to: boolean): void {
    this.positionInput.disabled = to
    this.durationInput.disabled = to
  }

  get duration (): number {
    return this._duration
  }

  set duration (seconds: number) {
    this.durationInput.value = seconds
    this.positionInput.max = seconds
    this._duration = seconds
  }

  get position (): number {
    return this._position
  }

  set position (seconds: number) {
    this.positionInput.value = seconds
    this._position = seconds
  }
}

customElements.define('player-controls', PlayerControls)
