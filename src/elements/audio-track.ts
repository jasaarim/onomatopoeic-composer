import { type ActiveSound } from './active-sound'
import { type numFun, funDummy } from './utils'

interface TrackParams {
  trackNum: number
  totalNum: number
  getStart: numFun
  getDuration: numFun
}

export class AudioTrack extends HTMLElement {
  trackNum: number = -1
  totalNum: number = -1
  panValue: number = -1
  activeSounds: ActiveSound[]
  getStart: numFun = funDummy
  getDuration: numFun = funDummy

  constructor () {
    super()
    this.activeSounds = []
  }

  initialize (params: TrackParams): void {
    this.trackNum = params.trackNum
    this.totalNum = params.totalNum
    this.getDuration = params.getDuration
    this.getStart = params.getStart

    this.id = `track${this.trackNum}`
    // For stereo panning
    this.panValue = -1 + 2 / (this.totalNum - 1) * (this.trackNum - 1)
    this.append(`${this.trackNum}`)
  }

  audioEnd (): number {
    const activeSounds = this.activeSounds
    if (activeSounds.length === 0) {
      return 0
    } else {
      return this.lastEnd()
    }
  }

  lastEnd (): number {
    function soundEnd (activeSound: ActiveSound): number {
      return activeSound.position + activeSound.width
    }
    const end = this.activeSounds
      .map(activeSound => Math.max(soundEnd(activeSound) / 100 * this.getDuration(), 0))
      .reduce((a, b) => Math.max(a, b), 0)
    return end
  }

  async placeSound (activeSound: ActiveSound, position?: number): Promise<number> {
    if (position != null) {
      activeSound.setPosition(position, this.trackNum)
    }
    this.activeSounds.push(activeSound)
    this.append(activeSound)
    await activeSound.bufferReady
    const freePosition = this.getFreeSlot(activeSound, position)
    if (freePosition !== position) {
      activeSound.setPosition(freePosition, this.trackNum)
    }
    activeSound.setPan(this.panValue)
    return this.lastEnd()
  }

  removeSound (activeSound: ActiveSound): void {
    this.activeSounds = this.activeSounds.filter(item => item !== activeSound)
    activeSound.remove()
  }

  getFreeSlot (activeSound: ActiveSound, position?: number): number {
    if (position == null) {
      position = this.getStart() / this.getDuration() * 100
    }
    for (const elem of this.activeSounds) {
      if (elem !== activeSound) {
        const end = position + activeSound.width
        const elemEnd = elem.position + elem.width
        if ((elem.position >= position && elem.position < end) ||
          (elemEnd > position && elemEnd < end) ||
          (position >= elem.position && position < elemEnd)) {
          position = this.getFreeSlot(activeSound, elemEnd)
          break
        }
      }
    }
    return position
  }
}

customElements.define('audio-track', AudioTrack)
