import { SoundElement } from './sound-element'
import { type numFun, funDummy } from './utils'

import '../style/active-sound.css'

interface ActiveSoundParams {
  soundName: string
  descriptionFile: string
  audioFile: string
  buttonCallback: (sound: SoundElement) => void
  showDescription: (sound: SoundElement) => void
  sound: SoundElement
  getPlayerWidth: numFun
  getPlayerDuration: numFun
  getAudioCxt: () => AudioContext
}

export class ActiveSound extends SoundElement {
  sound?: SoundElement
  resolveBufferReady: () => void
  bufferReady: Promise<void>
  getPlayerWidth: numFun = funDummy
  getPlayerDuration: numFun = funDummy
  getAudioCxt: () => AudioContext = funDummy
  position: number = -1
  width: number = 0
  bufferSource?: AudioBufferSourceNode
  buffer?: AudioBuffer | null
  stereoPanner?: StereoPannerNode
  panner?: PannerNode

  constructor () {
    super()
    this.resolveBufferReady = () => { throw new Error('Impossible!') }
    this.bufferReady = new Promise(resolve => {
      this.resolveBufferReady = resolve
    })
  }

  initialize (params: ActiveSoundParams): void {
    super.initialize(params)
    this.sound = params.sound
    this.getPlayerDuration = params.getPlayerDuration
    this.getPlayerWidth = params.getPlayerWidth
    this.getAudioCxt = params.getAudioCxt

    // If the width is known by the source sound element, set it
    if (this.sound?.width != null) {
      this.style.width = `${this.sound.width}px`
    } else {
      // Set the initial width with this class and adjust it later
      this.classList.add('setting-buffer')
    }
    this.setBufferSource()
      .then(() => {
        this.adjustWidth()
        this.resolveBufferReady()
        // Remove the class after 300ms (the width should transition)
        setTimeout(() => { this.classList.remove('setting-buffer') }, 300)
      })
      .catch(error => { throw error })
  }

  setPosition (position: number, trackNum: number): void {
    this.position = position
    this.id = `active-sound-track${trackNum}-${this.position}`
    this.style.left = `${this.position}%`
  }

  adjustWidth (): void {
    if (this.bufferSource == null || this.bufferSource.buffer == null) {
      throw new Error('Null audio buffer')
    }
    const audioDuration = this.bufferSource.buffer.duration
    const width = audioDuration / this.getPlayerDuration() * 100
    this.width = width
    this.style.width = `${this.width}%`
    if (this.sound != null) {
      this.sound.width = width / 100 * this.getPlayerWidth()
    }
  }

  async setBufferSource (): Promise<void> {
    const audioCxt = this.getAudioCxt()
    const source = audioCxt.createBufferSource()
    if (this.buffer != null) {
      source.buffer = this.buffer
    } else {
      if (this.audio === null || this.audio === undefined) {
        throw new Error('No audio for BufferSource')
      }
      if (this.audioFile == null) {
        throw new Error('No audio file')
      }
      await fetchAudioBuffer(this.audioFile, audioCxt, source)
      // On iOS Safari there seems to be no way of knowing when the
      // audio data is decoded, hence the following check.
      let waits = 50
      while (waits > 0 && (source.buffer == null)) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        waits--
      }
      this.buffer = source.buffer
    }
    this.bufferSource = source
    this.buffer = source.buffer
    this.connectBufferSource(this.bufferSource)
  }

  connectBufferSource (bufferSource: AudioBufferSourceNode): void {
    const audioCxt = this.getAudioCxt()
    let panner
    if (audioCxt.createStereoPanner != null) {
      panner = audioCxt.createStereoPanner()
      this.stereoPanner = panner
    } else {
      panner = audioCxt.createPanner()
      panner.panningModel = 'equalpower'
      this.panner = panner
    }
    bufferSource.connect(panner)
    panner.connect(audioCxt.destination)
  }

  renewBufferSource (): void {
    const audioCxt = this.getAudioCxt()
    const source = audioCxt.createBufferSource()
    if (this.buffer == null) {
      throw new Error('Null buffer')
    }
    source.buffer = this.buffer
    this.bufferSource = source
    this.connectBufferSource(this.bufferSource)
  }

  setPan (panValue: number): void {
    if (this.stereoPanner != null) {
      this.stereoPanner.pan.value = panValue
    } else if (this.panner != null) {
      this.panner.setPosition(panValue, 0, 1 - Math.abs(panValue))
    }
  }

  calculateAudioStart (playerDuration: number, playerStart: number): number {
    let startSeconds = this.position / 100 * playerDuration
    startSeconds = startSeconds - playerStart
    return startSeconds
  }
}

async function fetchAudioBuffer (src: string, audioCxt: AudioContext, bufferSource: AudioBufferSourceNode): Promise<AudioBuffer> {
  return await fetch(src)
    .then(async response => await response.arrayBuffer())
    .then(async data => await audioCxt.decodeAudioData(
      data,
      buffer => { bufferSource.buffer = buffer },
      error => { throw error }
    ))
}

customElements.define('active-sound', ActiveSound)
