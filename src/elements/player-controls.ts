import { createShadow, funDummy, resolveDummy } from './utils.js'

interface ControlsParams {
  playerPlay: () => void
  playerStop: () => void
}

export class PlayerControls extends HTMLElement {
  playerPlay: () => void = funDummy
  playerStop: () => void = funDummy
  playButton: HTMLButtonElement = document.createElement('button')
  stopButton: HTMLButtonElement = document.createElement('button')
  start: number = -1
  duration: number = -1
  startDisplay: HTMLElement = document.createElement('p')
  durationDisplay: HTMLElement = document.createElement('p')
  connect: () => void
  connected: Promise<void>

  static fromParams (params: ControlsParams): PlayerControls {
    let controls = new PlayerControls()
    controls = Object.assign(controls, params)
    controls.initialize()
    return controls
  }

  constructor () {
    super()
    createShadow('player-controls', this, () => { this.finishShadow() })
    this.connect = resolveDummy
    this.connected = new Promise((resolve) => {
      this.connect = resolve
    })
  }

  initialize (): void {
    this.connected
      .then(() => {
        this.playButton.addEventListener('click', () => { this.play() })
        this.stopButton.addEventListener('click', () => { this.stop() })
      })
      .catch(error => { throw error })
  }

  play (): void {
    this.hasAttribute('playing') ? this.removeAttribute('playing') : this.setAttribute('playing', '')
    this.playerPlay()
  }

  stop (stopPlayer: boolean = true): void {
    this.removeAttribute('playing')
    // With this the player can also stop the control without
    // triggering an infinite recursion
    if (stopPlayer) this.playerStop()
  }

  finishShadow (): void {
    this.playButton = this.shadowRoot?.querySelector('#play-button') as HTMLButtonElement
    this.stopButton = this.shadowRoot?.querySelector('#stop-button') as HTMLButtonElement
    this.startDisplay = this.shadowRoot?.querySelector('#start-display') as HTMLElement
    this.durationDisplay = this.shadowRoot?.querySelector('#duration-display') as HTMLElement
    // This means that somebody has already called setStart or setDuration
    if (this.start !== -1) this.setStart(this.start)
    if (this.duration !== -1) this.setDuration(this.duration)
    this.connect()
  }

  // We should set the duration display to an input element
  setDuration (duration: number): void {
    this.duration = duration
    duration = Math.round(duration * 10) / 10
    this.durationDisplay.textContent = `${duration} s`
  }

  setStart (start: number): void {
    this.start = start
    start = Math.round(start * 10) / 10
    this.startDisplay.textContent = `@ ${start.toFixed(1)} s`
  }
}

customElements.define('player-controls', PlayerControls)
