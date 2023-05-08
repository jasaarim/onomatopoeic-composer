import { funDummy } from './utils'

interface CursorParams {
  getPlayerDuration: () => number
  getPlayerStart: () => number
  playerStop: () => void
}

export class PlayerCursor extends HTMLElement {
  getPlayerDuration: CursorParams['getPlayerDuration'] = funDummy
  getPlayerStart: CursorParams['getPlayerStart'] = funDummy
  playerStop: CursorParams['playerStop'] = funDummy

  constructor () {
    super()
    this.style.left = '0%'
    this.addEventListener('transitionend', () => {
      this.stop()
      this.playerStop()
    })
  }

  initialize (params: CursorParams): void {
    this.getPlayerDuration = params.getPlayerDuration
    this.getPlayerStart = params.getPlayerStart
    this.playerStop = params.playerStop
  }

  play (): void {
    const duration = this.getPlayerDuration() - this.getPlayerStart()
    const position = this.getPlayerStart() / this.getPlayerDuration()
    this.style.left = `${position}%`
    this.style.transitionDuration = `${duration}s`
    this.style.left = '100%'
  }

  pause (): void {
    this.style.transitionDuration = 'unset'
  }

  stop (): void {
    this.style.transitionDuration = 'unset'
  }

  update (): void {
    const startPercentage = this.getPlayerStart() / this.getPlayerDuration() * 100
    this.style.left = `${startPercentage}%`
  }
}

customElements.define('player-cursor', PlayerCursor)
