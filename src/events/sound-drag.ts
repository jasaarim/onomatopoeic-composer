import { type AudioPlayer } from '../components/audio-player'
import { ActiveSound } from '../components/active-sound'
import { type SoundElement } from '../components/sound-element'
import { AudioTrack } from '../components/audio-track'
import { type OnomatopoeicComposer } from '../components/onomatopoeic-composer'

interface Clone extends SoundElement {
  startX: number
  sound: SoundElement
  shiftX: number
  shiftY: number
  player?: AudioPlayer
  leaveTrack: () => void
  enterTrack: () => void
  drop: (event: PointerEvent) => void
  positionOnTrack: (event: PointerEvent) => number
  currentTrack?: AudioTrack
  pointerMove: (event: PointerEvent) => void
  pointerUp: (event: PointerEvent) => void
  app: OnomatopoeicComposer
}

export default function drag (event: PointerEvent, sound: SoundElement): void {
  try { window.navigator.vibrate(50) } catch {}
  const clone = sound.cloneNode(true) as Clone
  clone.classList.add('clone')
  clone.app = document.querySelector('onomatopoeic-composer') as OnomatopoeicComposer
  clone.player = clone.app.audioPlayer
  clone.app.append(clone)

  // We only need X to find out the position on the track
  clone.startX = event.pageX
  clone.sound = sound
  // Position of the pointer within the sound
  clone.shiftX = event.clientX - sound.getBoundingClientRect().left
  clone.shiftY = event.clientY - sound.getBoundingClientRect().top

  const activeSoundWidth = (clone.sound as ActiveSound)?.sound?.width
  if (activeSoundWidth != null) {
    clone.style.width = `${activeSoundWidth}px`
  } else if (clone.sound.width != null) {
    clone.style.width = `${clone.sound.width}px`
  }
  clone.leaveTrack = () => { leaveTrack(clone) }
  clone.enterTrack = () => { enterTrack(clone) }
  clone.drop = (event) => { drop(clone, event) }
  clone.positionOnTrack = (event) => positionOnTrack(clone, event)

  // Bind for the event listeners
  clone.pointerMove = (event) => { pointerMove(clone, event) }
  clone.pointerUp = (event) => { pointerUp(clone, event) }

  clone.pointerMove(event)
  clone.app.addEventListener('pointermove', clone.pointerMove,
    { passive: true })
  clone.app.addEventListener('pointerup', clone.pointerUp)
  clone.app.addEventListener('pointercancel', clone.pointerUp)
}

function pointerMove (clone: Clone, event: PointerEvent): void {
  if (clone.currentTrack != null) {
    clone.style.left = `${clone.positionOnTrack(event)}%`
    clone.style.top = '0px'
  } else {
    clone.style.left = `${event.pageX - clone.shiftX}px`
    clone.style.top = `${event.pageY - clone.shiftY}px`
  }

  clone.style.visibility = 'hidden'
  const elemBelow = document.elementFromPoint(event.pageX, event.pageY) as HTMLElement
  clone.style.visibility = 'visible'

  let trackBelow
  if (elemBelow instanceof AudioTrack) {
    trackBelow = elemBelow
  } else {
    trackBelow = elemBelow.closest('audio-track') as AudioTrack
  }

  if (trackBelow !== clone.currentTrack) {
    clone.leaveTrack()
    clone.currentTrack = trackBelow
    clone.enterTrack()
  }
}

function enterTrack (clone: Clone): void {
  if (clone.currentTrack != null) {
    clone.currentTrack.append(clone)
    clone.currentTrack.style.opacity = '0.7'
  }
}

function leaveTrack (clone: Clone): void {
  if (clone.currentTrack != null) {
    clone.app.append(clone)
    clone.currentTrack.style.opacity = 'unset'
  }
}

function pointerUp (clone: Clone, event: PointerEvent): void {
  if (clone.currentTrack != null) {
    clone.drop(event)
  } else if (clone.sound instanceof ActiveSound) {
    clone.player?.removeSound(clone.sound)
  }
  clone.app.removeEventListener('pointermove', clone.pointerMove)
  clone.app.removeEventListener('pointerup', clone.pointerUp)
  clone.app.removeEventListener('pointercancel', clone.pointerUp)
  clone.remove()
}

function drop (clone: Clone, event: PointerEvent): void {
  const position = clone.positionOnTrack(event)
  if (clone.player == null) {
    throw new Error('No player for the moving sound')
  }
  const start = position / 100 * clone.player.duration
  clone.player.soundToTrack(clone.sound, clone.currentTrack, start)
    .catch(error => { throw error })
  clone.leaveTrack()
}

function positionOnTrack (clone: Clone, event: PointerEvent): number {
  const dx = event.pageX - clone.startX
  if (clone.currentTrack === null || clone.currentTrack === undefined) {
    throw new Error('Null or undefined current track')
  }
  let position = dx / clone.currentTrack.clientWidth * 100
  const trackPosition = (clone.sound as ActiveSound).position
  if (!isNaN(trackPosition)) position += trackPosition
  return position
}
