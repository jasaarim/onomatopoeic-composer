export class NumberInput extends HTMLElement {
  /**
   * A wrapper for <input type="number"> with some helper methods.
   *
   * This could be implemented a bit more simply as a customized
   * built-in element, but Webkit does not support that:
   * https://bugs.webkit.org/show_bug.cgi?id=182671
   *
   */
  input: HTMLInputElement
  lastInput?: number
  lastNumber?: number
  waitTime: number

  constructor () {
    super()
    this.input = document.createElement('input')
    this.appendChild(this.input)
    this.waitTime = 500
    this.input.type = 'number'
    this.input.min = '0'
    this.input.inputMode = 'decimal'
    this.input.onclick = () => { this.input.select() }
    this.input.oninput = () => { this._oninput() }
    this.input.onblur = () => { this._onblur() }
    this.input.onchange = () => { this._onchange() }
  }

  get max (): number {
    return Number(this.input.max)
  }

  set max (num: number) {
    this.input.max = `${num}`
  }

  get disabled (): boolean {
    return this.input.disabled
  }

  set disabled (value: boolean) {
    this.input.disabled = value
  }

  _oninput (): void {
    this.lastInput = Date.now()
    setTimeout(() => {
      this.maybeTriggerUpdate()
    }, this.waitTime)
  }

  _onblur (): void {
    if (this.value === 0 || Number.isNaN(this.value)) {
      if (this.lastNumber != null) {
        this.value = this.lastNumber
      }
    }
    this.update()
  }

  _onchange (): void {
    this.update()
  }

  maybeTriggerUpdate (): void {
    const now = Date.now()
    if (this.lastInput != null) {
      const elapsed = now - this.lastInput
      if (elapsed >= this.waitTime) {
        this.update()
      }
    }
  }

  get value (): number {
    let value = Number(this.input.value)
    value = Math.round(value * 10) / 10
    return value
  }

  set value (num: number) {
    num = Math.round(num * 10) / 10
    this.input.value = `${num.toFixed(1)}`
    this.lastNumber = num
  }

  update (): void {
    delete this.lastInput
    const detail = this.value
    if (detail > 0 && !Number.isNaN(detail)) {
      const event = new CustomEvent('update', { detail })
      this.dispatchEvent(event)
    }
  }
}

customElements.define('number-input', NumberInput)
