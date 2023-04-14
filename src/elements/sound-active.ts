import { newSound, type Sound } from './sound.js'
import { type Player } from './player.js'
import { type Track } from './track.js'

export interface ActiveSound extends Sound {
  player: Player
  track: Track
  move: (track: Track, position: number, checkForOverLap?: boolean) => void
  endTime: () => number
  adjustWidth: (setDuration?: boolean) => void
  noOverlap: () => void
  setPan: () => void
  position: number
  width: number
}

export function soundToTrack (sound: Sound, track?: Track | null, position?: number): void {
  const player = document.querySelector('#player') as Player
  if (track === null || track === undefined) {
    track = player.getATrack()
    if (position !== undefined) {
      position = track.audioEnd() / player.duration * 100
    }
  }
  if (position === 0 || position === undefined) {
    position = player.start / player.duration * 100
  }
  if (sound.classList.contains('active')) {
    (sound as ActiveSound).move(track, position, true)
  } else {
    newActiveSound(sound, track, position).catch((error) => { throw error })
  }
}

async function newActiveSound (sound: Sound, target: Track, position: number): Promise<ActiveSound> {
  const player = document.querySelector('#player') as Player

  const activeSound = newSound(sound.name, sound.files) as ActiveSound
  activeSound.classList.add('active')
  // Set the initial width and remove the class after width adjustment
  activeSound.classList.add('initial')
  activeSound.player = player

  activeSound.move = (track, position, checkForOverLap) => { moveSound(activeSound, track, position, checkForOverLap) }
  activeSound.endTime = () => endTime(activeSound)
  activeSound.adjustWidth = (setDuration?) => { adjustSoundWidth(activeSound, setDuration) }
  activeSound.noOverlap = () => { noOverlap(activeSound) }
  activeSound.setPan = () => { setPan(activeSound) }

  activeSound.move(target, position)
  const audioCxt = player.getAudioCxt()

  activeSound.bufferSource = await newBufferSource(activeSound, audioCxt)
  activeSound.buffer = activeSound.bufferSource.buffer
  activeSound.renewBufferSource = () => { renewBufferSource(activeSound, audioCxt) }
  activeSound.setPan()
  activeSound.adjustWidth(true)
  activeSound.classList.remove('initial')
  activeSound.noOverlap()

  return activeSound
}

function moveSound (activeSound: ActiveSound, target: Track, position: number, checkForOverlap?: boolean): void {
  if (activeSound.track !== undefined) {
    activeSound.track.activeSounds = activeSound.track.activeSounds.filter(item => item !== activeSound)
  }
  activeSound.position = position
  activeSound.id = `active-sound-${target.id}-${activeSound.position}`
  activeSound.style.left = `${activeSound.position}%`
  target.append(activeSound)
  target.activeSounds.push(activeSound)
  activeSound.track = target
  if (checkForOverlap === true) {
    activeSound.noOverlap()
  }
  if (activeSound.endTime() > activeSound.player.duration) {
    const audioEnd = activeSound.player.audioEnd()
    if (audioEnd === null) {
      throw new Error('null audio end')
    }
    activeSound.player.setDuration(audioEnd)
  }
  activeSound.setPan()
}

function endTime (activeSound: ActiveSound): number {
  return (activeSound.position + activeSound.width) / 100 * activeSound.player.duration
}

function adjustSoundWidth (activeSound: ActiveSound, setDuration?: boolean): void {
  const player = activeSound.player
  if (activeSound.bufferSource.buffer === null) {
    throw new Error('Null audio buffer')
  }
  const audioDuration = activeSound.bufferSource.buffer.duration
  const width = audioDuration / player.duration * 100
  activeSound.width = width
  activeSound.style.width = `${activeSound.width}%`
  const audioEnd = player.audioEnd()
  if (audioEnd === null) {
    throw new Error('null audio end')
  }
  if (setDuration === true && audioEnd > player.duration) { player.setDuration(audioEnd) }
}

function noOverlap (activeSound: ActiveSound): void {
  const position = activeSound.position
  const end = activeSound.position + activeSound.width
  for (const elem of activeSound.track.activeSounds) {
    if (elem !== activeSound) {
      const elemEnd = elem.position + elem.width
      if ((elem.position >= position && elem.position < end) ||
        (elemEnd > position && elemEnd < end) ||
        (position >= elem.position && position < elemEnd)) {
        activeSound.move(activeSound.track, elemEnd, true)
        break
      }
    }
  }
}

async function newBufferSource (activeSound: ActiveSound, audioCxt: AudioContext): Promise<AudioBufferSourceNode> {
  const source = audioCxt.createBufferSource()
  if (activeSound.buffer != null) {
    source.buffer = activeSound.buffer
  } else {
    if (activeSound.audio === null || activeSound.audio === undefined) {
      throw new Error('No audio for BufferSource')
    }
    await fetchAudioBuffer(activeSound.audio.src, audioCxt, source)
    // On iOS Safari there seems to be no way of knowing when the
    // audio data is decoded, hence the following check.
    let waits = 50
    while (waits > 0 && (source.buffer == null)) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      waits--
    }
    activeSound.buffer = source.buffer
  }
  connectBufferSource(activeSound, source, audioCxt)
  return source
}

function renewBufferSource (activeSound: ActiveSound, audioCxt: AudioContext): void {
  const source = audioCxt.createBufferSource()
  source.buffer = activeSound.buffer
  activeSound.bufferSource = source
  connectBufferSource(activeSound, source, audioCxt)
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

function connectBufferSource (sound: Sound, bufferSource: AudioBufferSourceNode, audioCxt: AudioContext): void {
  let panner
  if (audioCxt.createStereoPanner !== undefined) {
    panner = audioCxt.createStereoPanner()
    sound.stereoPanner = panner
  } else {
    panner = audioCxt.createPanner()
    panner.panningModel = 'equalpower'
    sound.panner = panner
  }
  bufferSource.connect(panner)
  panner.connect(audioCxt.destination)
}

function setPan (activeSound: ActiveSound): void {
  const value = activeSound.track.panValue
  if (activeSound.stereoPanner != null) { activeSound.stereoPanner.pan.value = value } else if (activeSound.panner != null) { activeSound.panner.setPosition(value, 0, 1 - Math.abs(value)) }
}
