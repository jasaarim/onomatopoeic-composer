import { type Player } from './player.js'
import { type ActiveSound } from './sound-active.js'

export interface PlayerControls extends HTMLElement {
  player: Player
  playButton: HTMLButtonElement
  stopButton: HTMLButtonElement
  audioStart: (sound: ActiveSound) => number
  play: () => void
  pause: () => void
  stop: () => void
}

function initialize (): void {
  const controls = document.querySelector('#player-controls') as PlayerControls

  controls.player = document.querySelector('#player') as Player
  controls.playButton = controls.querySelector('#play-button') as HTMLButtonElement
  controls.stopButton = controls.querySelector('#stop-button') as HTMLButtonElement

  controls.audioStart = (sound) => audioStart(controls, sound)
  controls.play = () => { play(controls) }
  controls.pause = () => { pause(controls) }
  controls.stop = () => { stop(controls) }
}

function play (playerControls: PlayerControls): void {
  playerControls.player.warmupAudioCxt()
  if (!playerControls.player.classList.contains('playing')) {
    playerControls.player.classList.add('playing')
    const audioCxt = playerControls.player.getAudioCxt()
    if (audioCxt.state === 'suspended') {
      audioCxt.resume().catch(error => { throw error })
    }
    playerControls.player.applyActiveSounds((sound) => {
      let start = playerControls.audioStart(sound)
      const offset = Math.max(0, -start)
      start = Math.max(0, start)
      sound.bufferSource.start(audioCxt.currentTime + start, offset)
    })
    playerControls.player.cursor.play()
  } else {
    playerControls.pause()
  }
}

function audioStart (playerControls: PlayerControls, sound: ActiveSound): number {
  let startSeconds = sound.position / 100 * playerControls.player.duration
  startSeconds = startSeconds - playerControls.player.start
  return startSeconds
}

function stop (playerConstrols: PlayerControls): void {
  if (playerConstrols.player.classList.contains('playing')) {
    playerConstrols.pause()
  }
  playerConstrols.player.setStart(0)
  playerConstrols.player.cursor.stop()
}

function pause (playerControls: PlayerControls): void {
  playerControls.player.applyActiveSounds((sound) => {
    sound.bufferSource.stop()
    sound.renewBufferSource()
    sound.setPan()
  })
  playerControls.player.classList.remove('playing')
  playerControls.player.getAudioCxt().suspend().catch(error => { throw error })
  playerControls.player.cursor.pause()
}

initialize()
