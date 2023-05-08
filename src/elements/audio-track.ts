import { type ActiveSound } from './active-sound'
import { funDummy } from './utils'

interface TrackParams {
  trackNum: number
  totalNum: number
  getStart: () => number
  getDuration: () => number
}

export class AudioTrack extends HTMLElement {
  trackNum: number = -1
  totalNum: number = -1
  panValue: number = -1
  activeSounds: ActiveSound[]
  getStart: TrackParams['getStart'] = funDummy
  getDuration: TrackParams['getDuration'] = funDummy

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

  async placeSound (activeSound: ActiveSound, start?: number, fromState: boolean = false): Promise<number> {
    if (start != null) {
      start = Math.ceil(start * 100) / 100
      activeSound.setStart(start)
    }
    this.activeSounds.push(activeSound)
    this.append(activeSound)
    await activeSound.bufferReady
    let newStart = (start != null) ? start : this.getStart()
    if (!fromState) {
      newStart = await this.getFreeSlot(activeSound, newStart)
    }
    if (newStart !== start) {
      newStart = Math.ceil(newStart * 100) / 100
      activeSound.setStart(newStart)
    }
    activeSound.setPan(this.panValue)
    return newStart
  }

  removeSound (activeSound: ActiveSound): void {
    this.activeSounds = this.activeSounds.filter(item => item !== activeSound)
    activeSound.remove()
  }

  async getFreeSlot (activeSound: ActiveSound, start: number): Promise<number> {
    for (const elem of this.activeSounds) {
      await elem.bufferReady
      if (elem !== activeSound) {
        const end = start + activeSound.duration
        const elemEnd = elem.start + elem.duration
        if ((elem.start >= start && elem.start < end) ||
          (elemEnd > start && elemEnd < end) ||
          (start >= elem.start && start < elemEnd)) {
          start = await this.getFreeSlot(activeSound, elemEnd)
          break
        }
      }
    }
    return start
  }
}

customElements.define('audio-track', AudioTrack)
