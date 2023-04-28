import { type numFun, funDummy } from './utils.js'

interface CursorParams {
  getPlayerDuration: numFun
  getPlayerStart: numFun
  playerStop: () => void
}

export class PlayerCursor extends HTMLElement {
  getPlayerDuration: numFun = funDummy
  getPlayerStart: numFun = funDummy
  playerStop: () => void = funDummy

  static fromParams (params: CursorParams): PlayerCursor {
    let cursor = new PlayerCursor()
    cursor = Object.assign(cursor, params)
    return cursor
  }

  constructor () {
    super()
    this.style.left = '0%'
    this.addEventListener('transitionend', () => {
      this.stop()
      this.playerStop()
    })
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
