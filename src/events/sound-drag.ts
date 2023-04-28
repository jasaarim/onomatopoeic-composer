import { type AudioPlayer } from '../elements/audio-player.js'
import { type ActiveSound } from '../elements/active-sound.js'
import { type SoundElement } from '../elements/sound-element.js'
import { type AudioTrack } from '../elements/audio-track.js'
import { type App } from '../elements/app.js'

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
  app: App
}

export default function drag (event: PointerEvent, sound: SoundElement): void {
  try { window.navigator.vibrate(50) } catch {}
  const clone = sound.cloneNode(true) as Clone
  clone.classList.add('clone')
  const app = document.querySelector('app-') as App
  clone.app = app
  app.shadowRoot?.append(clone)

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
  app.addEventListener('pointermove', clone.pointerMove,
    { passive: true })
  app.addEventListener('pointerup', clone.pointerUp)
  app.addEventListener('pointercancel', clone.pointerUp)
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
  const elemBelow = clone.app.shadowRoot?.elementFromPoint(event.pageX, event.pageY) as HTMLElement

  let trackBelow
  if (elemBelow?.tagName === 'AUDIO-PLAYER') {
    clone.player = elemBelow as AudioPlayer
    const elemInPlayer = elemBelow.shadowRoot?.elementFromPoint(event.pageX, event.pageY)
    trackBelow = elemInPlayer?.closest('audio-track') as AudioTrack
  } else {
    delete clone.player
  }
  clone.style.visibility = 'visible'

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
    clone.app.shadowRoot?.append(clone)
    clone.currentTrack.style.opacity = 'unset'
  }
}

function pointerUp (clone: Clone, event: PointerEvent): void {
  if (clone.currentTrack != null) {
    clone.drop(event)
  } else if ((clone.sound as ActiveSound).sound != null) {
    clone.sound.remove()
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
  clone.player.soundToTrack(clone.sound, clone.currentTrack, position)
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
