export class PlayerCursor extends HTMLElement {
  _duration: number = -1
  _position: number = -1

  constructor () {
    super()
    this.style.left = '0%'
    this.addEventListener('transitionend', () => { this.dispatchEvent(new CustomEvent('end')) })
  }

  get position (): number {
    return this._position
  }

  set position (seconds: number) {
    this._position = seconds
    this.update()
  }

  get duration (): number {
    return this._duration
  }

  set duration (seconds: number) {
    this._duration = seconds
    this.update()
  }

  play (): void {
    const remainingDuration = this.duration - this.position
    const left = this.position / this.duration * 100
    this.style.left = `${left}%`
    this.style.transitionDuration = `${remainingDuration}s`
    this.style.left = '100%'
  }

  pause (): void {
    this.style.transitionDuration = 'unset'
  }

  stop (): void {
    this.style.transitionDuration = 'unset'
  }

  update (): void {
    const left = this.position / this.duration * 100
    this.style.left = `${left}%`
  }
}

customElements.define('player-cursor', PlayerCursor)
