import { type Description } from '../elements/description.js'
import { type Player } from '../elements/player.js'
import { type Sound } from '../elements/sound.js'
import { type ActiveSound } from '../elements/sound-active.js'
import { type Track } from '../elements/track.js'

function keyboardInteraction (event: KeyboardEvent): void {
  const sound = (document.activeElement as HTMLElement).closest('.sound') as Sound
  if (sound !== null) {
    if (event.keyCode === 32) {
      // Space
      const description = document.querySelector('#description') as Description
      if (description.soundName === sound.name && (description.audio != null)) {
        if (document.activeElement !== sound.addButton) {
          description.play()
          event.preventDefault()
        }
      }
    } else if (event.keyCode === 13) {
      // Enter
      if (document.activeElement !== sound.addButton && !sound.classList.contains('active')) {
        sound.addButton.click()
      }
    } else if ([37, 38, 39, 40].includes(event.keyCode)) {
      // Arrow keys
      if (sound.classList.contains('active')) {
        moveSound(sound as ActiveSound, event)
      } else if ([37, 39].includes(event.keyCode)) {
        moveCursor(event)
      } else {
        changeSoundMenuFocus(sound, event)
      }
    }
  } else if ([37, 39].includes(event.keyCode)) {
    // Left and right arrow keys
    moveCursor(event)
  } else if ([38, 40].includes(event.keyCode)) {
    // Up and down arrow keys
    changeSoundMenuFocus(null, event)
  }
}

function changeSoundMenuFocus (sound: Sound | null, event: KeyboardEvent): void {
  if (event.keyCode === 38) {
    if (sound !== null && (sound?.previousSibling as HTMLElement)?.classList.contains('sound')) {
      (sound.previousSibling as HTMLElement).focus()
    } else {
      (document.querySelector('#sound-menu .sound:last-child') as HTMLElement).focus()
    }
  } else if (event.keyCode === 40) {
    if ((sound !== null) && (sound?.nextSibling as HTMLElement)?.classList.contains('sound')) {
      (sound.nextSibling as HTMLElement).focus()
    } else {
      (document.querySelector('#sound-menu .sound') as HTMLElement).focus()
    }
  }
  event.preventDefault()
}

function moveSound (sound: ActiveSound, event: KeyboardEvent): void {
  let position = sound.position
  let track = sound.track
  if (event.keyCode === 39) position = Math.round(sound.position + 1)
  else if (event.keyCode === 37) position = Math.round(sound.position - 1)
  else if (event.keyCode === 38 &&
    (track?.previousSibling as HTMLElement)?.classList.contains('track')) {
    track = track.previousSibling as Track
  } else if (event.keyCode === 40 &&
    (track.nextSibling != null) && (track?.nextSibling as HTMLElement)?.classList.contains('track')) {
    track = track.nextSibling as Track
  }
  sound.move(track, position, true)
  sound.focus()
}

function moveCursor (event: KeyboardEvent): void {
  const player = document.querySelector('#player') as Player
  let start = null
  if (event.keyCode === 39) {
    start = Math.min(player.start + 0.01 * player.duration,
      0.99 * player.duration)
  } else if (event.keyCode === 37) { start = Math.max(player.start - 0.01 * player.duration, 0) }
  if (start !== null) { player.setStart(start) }
}

export default keyboardInteraction
