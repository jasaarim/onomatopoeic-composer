import { AudioTrack } from './audio-track.js'
import { ActiveSound } from './active-sound.js'
import { PlayerCursor } from './player-cursor.js'
import { PlayerControls } from './player-controls.js'
import { makeStyleNode } from './utils.js'
import { type SoundElement } from './sound-element.js'

export class AudioPlayer extends HTMLElement {
  duration: number
  _start: number = 0
  cursor: PlayerCursor
  controls: PlayerControls
  tracks: AudioTrack[]
  length: number
  warmedUp: boolean = false
  started?: number
  _audioCxt?: AudioContext

  constructor () {
    super()
    this.length = 8
    this.duration = 20
    const shadow = this.attachShadow({ mode: 'open' })

    const trackContainer = document.createElement('div')
    this.tracks = []
    for (let i = 1; i <= this.length; i++) {
      const track = this.makeTrack(i)
      trackContainer.append(track)
      this.tracks.push(track)
    }
    trackContainer.id = 'tracks'
    shadow.appendChild(trackContainer)

    this.cursor = this.makeCursor()
    trackContainer.appendChild(this.cursor)

    this.controls = this.makeControls()
    shadow.appendChild(this.controls)

    shadow.append(makeStyleNode('audio-player'))

    this.connectEvents()
  }

  makeTrack (trackNum: number): AudioTrack {
    return AudioTrack.fromParams({
      trackNum,
      totalNum: this.length,
      getDuration: () => this.duration,
      getStart: () => this.start
    })
  }

  makeCursor (): PlayerCursor {
    return PlayerCursor.fromParams({
      getPlayerDuration: () => this.duration,
      getPlayerStart: () => this.start,
      playerStop: () => { this.stop() }
    })
  }

  makeControls (): PlayerControls {
    const controls = PlayerControls.fromParams({
      playerPlay: () => { this.play() },
      playerStop: () => { this.stop() }
    })
    controls.setStart(this.start)
    controls.setDuration(this.duration)
    return controls
  }

  connectEvents (): void {
    this.addEventListener('pointerdown', (event) => { this.setCursorWithPointer(event) })
    this.addEventListener('keydown', (event) => { this.keyboardInteraction(event) })
  }

  setCursorWithPointer (event: PointerEvent): void {
    const target = this.shadowRoot?.elementFromPoint(event.pageX, event.pageY)
    if (target instanceof AudioTrack && (this.started == null)) {
      const x = event.clientX - this.tracks[0].getBoundingClientRect().left
      const start = x / this.width * this.duration
      this.start = start
    }
  }

  keyboardInteraction (event: KeyboardEvent): void {
    if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(event.code)) {
      const activeSound = this.shadowRoot?.activeElement
      if (activeSound instanceof ActiveSound) {
        event.stopPropagation()
        const position = activeSound.position
        const track = activeSound.parentElement as AudioTrack
        let newPosition = position
        let newTrack = track
        const trackIndex = this.tracks.indexOf(track)
        if (event.code === 'ArrowRight') {
          newPosition = position + 0.5
        } else if (event.code === 'ArrowLeft') {
          newPosition = position - 0.5
        } else if (event.code === 'ArrowUp') {
          let index = trackIndex - 1
          if (index < 0) {
            index = this.tracks.length - 1
          }
          newTrack = this.tracks[index]
        } else if (event.code === 'ArrowDown') {
          let index = trackIndex + 1
          if (index === this.tracks.length) {
            index = 0
          }
          newTrack = this.tracks[index]
        }
        if (newPosition >= 0) {
          this.soundToTrack(activeSound, newTrack, newPosition).catch(error => { throw error })
          activeSound.focus()
        }
      }
    }
  }

  get width (): number {
    return this.tracks[0].getBoundingClientRect().width
  }

  get start (): number {
    return this._start
  }

  set start (seconds: number) {
    if (seconds >= 0 && seconds < this.duration) {
      this._start = seconds
      this.updateCursor()
    } else {
      throw new Error(`Invalid start time: ${seconds}`)
    }
  }

  audioEnd (): number {
    let end = 0
    for (const track of this.tracks) {
      const trackEnd = track.audioEnd()
      if (trackEnd !== null && trackEnd > end) {
        end = trackEnd
      }
    }
    return end
  }

  async soundToTrack (sound: SoundElement, track?: AudioTrack, position?: number): Promise<void> {
    let activeSound: ActiveSound
    if (sound instanceof ActiveSound) {
      activeSound = sound
      // Make sure that the sound is remove from its track
      this.removeSound(activeSound)
    } else {
      if (sound.audioFile == null) {
        throw new Error('Cannot create active sound from null audio')
      }
      activeSound = ActiveSound.fromParams({
        soundName: sound.soundName,
        descriptionFile: sound.descriptionFile,
        audioFile: sound.audioFile,
        showDescription: sound.showDescription,
        getPlayerDuration: () => this.duration,
        getPlayerWidth: () => this.width,
        getAudioCxt: () => this.audioCxt,
        buttonCallback: (sound) => { this.removeSound(sound as ActiveSound) },
        sound
      })
    }
    if (track == null) {
      track = this.getATrack()
    }
    const audioEnd = await track.placeSound(activeSound, position)
    if (audioEnd > this.duration) {
      this.setDuration(audioEnd)
    }
  }

  getATrack (): AudioTrack {
    let firstEnd = this.duration
    let endsFirst
    for (const track of this.tracks) {
      const end = track.audioEnd()
      if (end === 0) {
        return track
      } else if (firstEnd !== 0 && end < firstEnd) {
        firstEnd = end
        endsFirst = track
      }
    }
    if (endsFirst == null) {
      endsFirst = this.tracks[0]
    }
    return endsFirst
  }

  setDuration (seconds: number): void {
    if (seconds > 0) {
      const ratio = seconds / this.duration
      this.duration = seconds
      this.controls.setDuration(seconds)
      this.applyActiveSounds((activeSound: ActiveSound, track: AudioTrack) => {
        activeSound.adjustWidth()
        activeSound.setPosition(activeSound.position / ratio, track.trackNum)
      })
    } else {
      throw new Error(`Invalid duration: ${seconds}`)
    }
  }

  updateCursor (): void {
    this.controls.setStart(this.start)
    this.cursor.update()
  }

  get audioCxt (): AudioContext {
    if (this._audioCxt === undefined) {
      this._audioCxt = this.newAudioCxt()
    }
    return this._audioCxt
  }

  newAudioCxt (): AudioContext {
    let AudioCxt = window.AudioContext
    if (AudioCxt == null) {
      AudioCxt = (window as any).webkitAudioContext
    }
    const audioCxt = new AudioCxt()
    audioCxt.suspend().catch(error => { throw error })
    return audioCxt
  }

  clearAudioCxt (): void {
    if (this.audioCxt !== undefined) {
      this.audioCxt.close().catch(error => { throw error })
      delete this._audioCxt
    }
  }

  applyActiveSounds (action: (activeSound: ActiveSound, track: AudioTrack) => void): void {
    for (const track of this.tracks) {
      for (const activeSound of track.activeSounds) {
        action(activeSound, track)
      }
    }
  }

  removeSound (activeSound: ActiveSound): void {
    this.applyActiveSounds((sound, track) => {
      if (sound === activeSound) {
        track.removeSound(sound)
      }
    })
  }

  // Some mobile devices require this before the Audio Context works
  warmupAudioCxt (): void {
    if (!this.warmedUp) {
      this.applyActiveSounds(activeSound => {
        if (!this.warmedUp) {
          if (activeSound.audio == null) {
            throw new Error('No audio')
          }
          activeSound.audio.play().catch(() => {})
          activeSound.audio.pause()
          this.warmedUp = true
        }
      })
    }
  }

  play (): void {
    this.warmupAudioCxt()
    if (this.started != null) {
      this.pause()
    } else {
      this.started = Date.now()
      if (this.audioCxt.state === 'suspended') {
        this.audioCxt.resume().catch(error => { throw error })
      }
      this.applyActiveSounds((activeSound) => {
        let start = activeSound.calculateAudioStart(this.duration, this.start)
        const offset = Math.max(0, -start)
        start = Math.max(0, start)
        if (activeSound.bufferSource == null) {
          throw new Error('Buffersource null')
        }
        activeSound.bufferSource.start(this.audioCxt.currentTime + start, offset)
      })
      this.cursor.play()
      this.updatePositionText()
    }
  }

  pause (): void {
    this.applyActiveSounds((activeSound, track) => {
      if (activeSound.bufferSource == null) {
        throw new Error('Buffersource null')
      }
      activeSound.bufferSource.stop()
      activeSound.renewBufferSource()
      activeSound.setPan(track.panValue)
    })
    this.audioCxt.suspend().catch(error => { throw error })
    this.cursor.pause()
    if (this.started == null) {
      throw new Error('Calling pause when started attribute not set')
    }
    const time = (Date.now() - this.started) / 1000 + this.start
    this.start = time < this.duration ? time : 0
    delete this.started
  }

  stop (): void {
    if (this.started != null) {
      this.pause()
    }
    this.start = 0
    this.cursor.stop()
    this.controls.stop(false)
  }

  updatePositionText (): void {
    if (this.started != null) {
      const elapsed = Date.now() - this.started
      this.controls.setStart(this.start + elapsed / 1000)
      setTimeout(() => { this.updatePositionText() }, 100)
    }
  }
}

customElements.define('audio-player', AudioPlayer)
