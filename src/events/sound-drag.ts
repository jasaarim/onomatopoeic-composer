import { type Player } from '../elements/player.js'
import { type ActiveSound, soundToTrack } from '../elements/sound-active.js'
import { type Sound } from '../elements/sound.js'
import { type Track } from '../elements/track.js'

interface Clone extends Sound {
  startX: number
  sound: Sound
  shiftX: number
  shiftY: number
  leaveTrack: () => void
  enterTrack: () => void
  drop: (event: PointerEvent) => void
  positionOnTrack: (event: PointerEvent) => number
  currentTrack?: Track | null
  pointerMove: (event: PointerEvent) => void
  pointerUp: (event: PointerEvent) => void
}

export default function drag (event: PointerEvent): void {
  try { window.navigator.vibrate(50) } catch {}
  const player = document.querySelector('#player') as Player
  const sound = (event.target as HTMLElement).closest('.sound') as Sound
  const clone = sound.cloneNode(true) as Clone
  clone.classList.add('clone')
  document.body.append(clone)

  // We only need X to find out the position on the track
  clone.startX = event.pageX
  clone.sound = sound
  // Position of the pointer within the sound
  clone.shiftX = event.clientX - sound.getBoundingClientRect().left
  clone.shiftY = event.clientY - sound.getBoundingClientRect().top

  if (sound.buffer != null) {
    if (player.tracks === null) {
      throw new Error('Null tracks')
    }
    const trackWidth = player.tracks.clientWidth
    const width = sound.buffer.duration / player.duration * trackWidth
    clone.style.width = `${width}px`
  }
  clone.leaveTrack = () => { leaveTrack(clone) }
  clone.enterTrack = () => { enterTrack(clone) }
  clone.drop = (event) => { drop(clone, event) }
  clone.positionOnTrack = (event) => positionOnTrack(clone, event)

  // Bind for the event listeners
  clone.pointerMove = (event) => { pointerMove(clone, event) }
  clone.pointerUp = (event) => { pointerUp(clone, event) }

  clone.pointerMove(event)
  document.body.addEventListener('pointermove', clone.pointerMove,
    { passive: true })
  document.body.addEventListener('pointerup', clone.pointerUp)
  document.body.addEventListener('pointercancel', clone.pointerUp)
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

  const trackBelow = elemBelow.closest('.track') as Track

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
    document.body.append(clone)
    clone.currentTrack.style.opacity = 'unset'
  }
}

function pointerUp (clone: Clone, event: PointerEvent): void {
  if (clone.currentTrack != null) {
    clone.drop(event)
  } else if (clone.sound.classList.contains('active')) {
    clone.sound.remove()
  }
  document.body.removeEventListener('pointermove', clone.pointerMove)
  document.body.removeEventListener('pointerup', clone.pointerUp)
  document.body.removeEventListener('pointercancel', clone.pointerUp)
  clone.remove()
}

function drop (clone: Clone, event: PointerEvent): void {
  const position = clone.positionOnTrack(event)
  soundToTrack(clone.sound as ActiveSound, clone.currentTrack, position)
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
