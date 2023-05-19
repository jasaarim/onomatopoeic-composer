import { AudioTrack } from './audio-track'
import { ActiveSound } from './active-sound'
import { PlayerCursor } from './player-cursor'
import { PlayerControls } from './player-controls'
import { type SoundElement } from './sound-element'
import { funDummy } from './utils'
import { addSoundToURL, removeSoundFromURL, paramToURL } from './url-utils'

import '../style/audio-player.css'

export interface SoundEntry { soundName: string, trackNum: number, start: number }
export type SoundState = Map<number, SoundEntry>
export interface PlayerState { position?: number, duration?: number }

interface AudioPlayerParams {
  findSound: (soundName: string) => SoundElement
}

export class AudioPlayer extends HTMLElement {
  _position: number = -1
  _duration: number = -1
  cursor: PlayerCursor
  controls: PlayerControls
  tracks: AudioTrack[]
  length: number = 8
  warmedUp: boolean = false
  started?: number
  _audioCxt?: AudioContext
  soundsAdded: number
  soundState: SoundState
  initialized: boolean = false
  findSound: AudioPlayerParams['findSound'] = funDummy

  constructor () {
    super()
    this.soundsAdded = 0
    this.soundState = new Map()

    const trackContainer = document.createElement('div')
    this.tracks = []
    for (let i = 1; i <= this.length; i++) {
      const track = this.makeTrack(i)
      trackContainer.append(track)
      this.tracks.push(track)
    }
    trackContainer.id = 'tracks'
    this.appendChild(trackContainer)

    this.cursor = new PlayerCursor()
    trackContainer.appendChild(this.cursor)

    this.controls = new PlayerControls()
    this.appendChild(this.controls)

    this.connectEvents()

    // Set these to initialize dependent objects
    this.duration = 20
    this.position = 0
  }

  initialize (params: AudioPlayerParams): void {
    this.findSound = params.findSound
    this.initialized = true
  }

  makeTrack (trackNum: number): AudioTrack {
    const track = new AudioTrack()
    track.initialize({
      trackNum,
      totalNum: this.length
    })
    return track
  }

  connectEvents (): void {
    this.addEventListener('pointerdown', (event) => { this.setCursorWithPointer(event) })
    this.addEventListener('keydown', (event) => { this.keyboardInteraction(event) })
    this.cursor.addEventListener('end', () => { this.stop() })
    // https://github.com/microsoft/TypeScript/issues/28357
    this.controls.addEventListener('positionUpdate', (event) => {
      this.position = (event as CustomEvent).detail
    })
    this.controls.addEventListener('durationUpdate', (event) => {
      this.duration = (event as CustomEvent).detail
    })
    this.controls.addEventListener('play', () => { this.play() })
    this.controls.addEventListener('stop', () => { this.stop() })
  }

  setCursorWithPointer (event: PointerEvent): void {
    const target = document.elementFromPoint(event.pageX, event.pageY)
    if (target instanceof AudioTrack && (this.started == null)) {
      const x = event.clientX - this.tracks[0].getBoundingClientRect().left
      let position = x / this.width * this.duration
      position = Math.round(position * 10) / 10
      this.position = position
    }
  }

  keyboardInteraction (event: KeyboardEvent): void {
    /**
     * Move the player sounds with arrow keys
     */
    if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(event.code)) {
      const activeSound = document.activeElement
      if (activeSound instanceof ActiveSound) {
        event.stopPropagation()
        const start = activeSound.start
        const track = activeSound.parentElement as AudioTrack
        let newStart = start
        let newTrack = track
        const trackIndex = this.tracks.indexOf(track)
        const startStep = this.duration / 40
        if (event.code === 'ArrowRight') {
          newStart += startStep
        } else if (event.code === 'ArrowLeft') {
          newStart -= startStep
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
        newStart = Math.max(0, newStart)
        this.soundToTrack(activeSound, newTrack, newStart).catch(error => { throw error })
        activeSound.focus()
      }
    }
  }

  get width (): number {
    return this.tracks[0].getBoundingClientRect().width
  }

  get position (): number {
    return this._position
  }

  set position (seconds: number) {
    if (seconds >= 0 && seconds < this.duration) {
      this._position = seconds
      this.controls.position = seconds
      this.cursor.position = seconds
      this.tracks.forEach((track: AudioTrack) => { track.position = seconds })
      if (this.initialized) paramToURL('position', seconds)
    } else {
      throw new Error(`Invalid position: ${seconds}`)
    }
  }

  get duration (): number {
    return this._duration
  }

  set duration (seconds: number) {
    if (seconds > 0) {
      seconds = Math.ceil(seconds * 100) / 100
      this._duration = seconds
      if (this.position >= this.duration) {
        this.position = 0
      }
      this.controls.duration = seconds
      this.cursor.duration = seconds
      this.tracks.forEach((track: AudioTrack) => { track.duration = seconds })
      if (this.initialized) paramToURL('duration', seconds)
      this.applyActiveSounds((activeSound: ActiveSound) => {
        activeSound.updatePosition()
        activeSound.adjustWidth().catch((error) => { throw error })
      })
    } else {
      throw new Error(`Invalid duration: ${seconds}`)
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

  async soundToTrack (sound: SoundElement, track?: AudioTrack, start?: number, refNum?: number): Promise<void> {
    let activeSound: ActiveSound
    if (sound instanceof ActiveSound) {
      activeSound = sound
      // Make sure that the sound is removed from its track
      this.removeSound(activeSound, true)
    } else {
      if (sound.audioFile == null) {
        throw new Error('Cannot create active sound from null audio')
      }
      activeSound = new ActiveSound()
      activeSound.initialize({
        soundName: sound.soundName,
        descriptionFile: sound.descriptionFile,
        audioFile: sound.audioFile,
        showDescription: sound.showDescription,
        getPlayerDuration: () => this.duration,
        getPlayerWidth: () => this.width,
        getAudioCxt: () => this.audioCxt,
        buttonCallback: (sound) => { this.removeSound(sound as ActiveSound) },
        refNum: (refNum != null) ? refNum : this.soundsAdded++,
        sound
      })
    }
    if (track == null) {
      track = this.getATrack()
    }
    const fromState = refNum != null
    start = await track.placeSound(activeSound, start, fromState)
    if (!fromState) {
      const audioEnd = track.lastEnd()
      if (audioEnd > this.duration) {
        this.duration = audioEnd
      }
      refNum = activeSound.refNum
      const soundEntry = {
        soundName: activeSound.soundName,
        trackNum: track.trackNum,
        start
      }
      this.soundState.set(refNum, soundEntry)
      addSoundToURL(refNum, soundEntry)
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

  loadSoundState (soundState: SoundState): void {
    for (const [refNum, soundEntry] of soundState.entries()) {
      if (!('soundName' in soundEntry) || !('trackNum' in soundEntry) || !('start' in soundEntry)) {
        soundState.delete(refNum)
      } else {
        const sound = this.findSound(soundEntry.soundName)
        const track = this.tracks[soundEntry.trackNum - 1]
        const start = soundEntry.start
        this.soundToTrack(sound, track, start, refNum).catch((error) => { throw error })
        this.soundsAdded = Math.max(refNum + 1, this.soundsAdded)
      }
    }
    this.soundState = soundState
  }

  loadPlayerState (playerState: PlayerState): void {
    if (playerState.duration != null) {
      this.duration = playerState.duration
    }
    if (playerState.position != null) {
      this.position = playerState.position
    }
  }

  updateCursor (): void {
    this.controls.position = this.position
    this.cursor.update()
  }

  get audioCxt (): AudioContext {
    if (this._audioCxt == null) {
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
    if (this.audioCxt != null) {
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

  removeSound (activeSound: ActiveSound, keepInState: boolean = false): void {
    this.applyActiveSounds((sound, track) => {
      if (sound === activeSound) {
        track.removeSound(sound)
      }
    })
    if (!keepInState) {
      const refNum = activeSound.refNum
      this.soundState.delete(refNum)
      removeSoundFromURL(refNum)
    }
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
        let start = activeSound.calculateAudioStart(this.duration, this.position)
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
    const time = (Date.now() - this.started) / 1000 + this.position
    this.position = time < this.duration ? time : 0
    delete this.started
  }

  stop (): void {
    if (this.started != null) {
      this.pause()
    }
    this.position = 0
    this.cursor.stop()
    this.controls.stop(false)
  }

  updatePositionText (): void {
    if (this.started != null) {
      const elapsed = Date.now() - this.started
      this.controls.position = this.position + elapsed / 1000
      setTimeout(() => { this.updatePositionText() }, 100)
    }
  }
}

customElements.define('audio-player', AudioPlayer)
