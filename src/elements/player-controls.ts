import { parseTemplate, funDummy } from './utils'

import template from '../templates/player-controls.html'
import '../style/player-controls.css'

const nodes = parseTemplate(template)

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

  constructor () {
    super()
    this.appendChild(nodes.cloneNode(true))
    this.playButton = this.querySelector('#play-button') as HTMLButtonElement
    this.stopButton = this.querySelector('#stop-button') as HTMLButtonElement
    this.startDisplay = this.querySelector('#start-display') as HTMLElement
    this.durationDisplay = this.querySelector('#duration-display') as HTMLElement
    // This means that somebody has already called setStart or setDuration
    if (this.start !== -1) this.setStart(this.start)
    if (this.duration !== -1) this.setDuration(this.duration)

    this.playButton.addEventListener('click', () => { this.play() })
    this.stopButton.addEventListener('click', () => { this.stop() })
  }

  initialize (params: ControlsParams): void {
    this.playerPlay = params.playerPlay
    this.playerStop = params.playerStop
  }

  play (): void {
    this.classList.contains('playing') ? this.classList.remove('playing') : this.classList.add('playing')
    this.playerPlay()
  }

  stop (stopPlayer: boolean = true): void {
    this.classList.remove('playing')
    // With this the player can also stop the control without
    // triggering an infinite recursion
    if (stopPlayer) this.playerStop()
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
