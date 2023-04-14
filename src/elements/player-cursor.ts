import { type Player, type Tracks } from './player.js'

export interface Cursor extends HTMLElement {
  start: number
  player: Player
  tracks: Tracks
  play: () => void
  pause: () => void
  stop: () => void
}

function initialize (): void {
  const cursor = document.querySelector('#player-cursor') as Cursor

  cursor.player = document.querySelector('#player') as Player
  cursor.tracks = cursor.parentElement as Tracks

  cursor.play = () => { play(cursor) }
  cursor.pause = () => { pause(cursor) }
  cursor.stop = () => { stop(cursor) }
}

function play (cursor: Cursor): void {
  const duration = cursor.player.duration - cursor.player.start
  const position = cursor.player.start / cursor.player.duration
  const left = position * cursor.player.clientWidth
  cursor.style.left = `${left}px`
  cursor.style.transitionDuration = `${duration}s`
  cursor.style.left = '100%'
}

function pause (cursor: Cursor): void {
  const left = window.getComputedStyle(cursor).left
  const leftNum = Number(left.split('px')[0])
  const position = leftNum / cursor.player.clientWidth
  cursor.style.transitionDuration = 'unset'
  cursor.player.setStart(position * cursor.player.duration)
}

function stop (cursor: Cursor): void {
  cursor.style.transitionDuration = 'unset'
}

initialize()
