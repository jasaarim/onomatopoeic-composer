import { type Description } from '../elements/description.js'
import { type Player } from '../elements/player.js'
import { type PlayerControls } from '../elements/player-controls.js'
import { type Cursor } from '../elements/player-cursor.js'
import { type Sound } from '../elements/sound.js'
import { type ActiveSound, soundToTrack } from '../elements/sound-active.js'
import { type Track } from '../elements/track.js'
import dragScrollOrClick from './drag-and-drop.js'
import keyboardInteraction from './events-keyboard.js'

const player = document.querySelector('#player') as Player
const cursor = document.querySelector('#player-cursor') as Cursor
const playerControls = document.querySelector('#player-controls') as PlayerControls
const playButton = document.querySelector('#play-button') as HTMLButtonElement
const stopButton = document.querySelector('#stop-button') as HTMLButtonElement
const description = document.querySelector('#description') as Description
const descriptionPlayButton = document.querySelector('#description-play') as HTMLButtonElement

// Due to the hiding/showing address bar in some mobile browsers
// the vh unit is not consistent with the visible page size.  This should
// fix it.
function resizeVh (): void {
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

window.addEventListener('DOMContentLoaded', resizeVh)
window.addEventListener('resize', resizeVh)

playButton.addEventListener('click', () => { playerControls.play() })
stopButton.addEventListener('click', () => { playerControls.stop() })
cursor.addEventListener('transitionend', () => { stopButton.click() })

player.addEventListener('click', (event) => {
  if ((event.target as HTMLElement).className === 'track' &&
        !player.classList.contains('playing')) {
    const track = event.target as Track
    const x = event.clientX - track.getBoundingClientRect().left
    const start = x / track.clientWidth * player.duration
    player.setStart(start)
  }
})

document.addEventListener('keydown', event => {
  if ([13, 32, 37, 38, 39, 40].includes(event.keyCode)) { keyboardInteraction(event) }
})

descriptionPlayButton.addEventListener('click', () => { description.play() })

document.body.addEventListener('click', (event) => {
  if ((event.target as HTMLElement).className === 'add-button') {
    const sound = (event.target as HTMLElement).parentElement as Sound
    if (!sound.classList.contains('active')) { soundToTrack(sound as ActiveSound) } else { sound.remove() }
  }
})

document.body.addEventListener('focusin', (event) => {
  if ((event.target as HTMLElement).classList.contains('sound')) {
    description.show(event.target as Sound)
  }
})

document.body.addEventListener('pointerdown', (event) => {
  const sound = (event.target as HTMLElement).closest('.sound')
  if ((sound != null) && !sound.classList.contains('no-audio')) {
    dragScrollOrClick(event)
  }
}, { passive: true })
