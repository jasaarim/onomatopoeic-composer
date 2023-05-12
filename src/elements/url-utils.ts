import { type SoundEntry, type SoundState, type PlayerState } from './audio-player'

function replaceState (modifySearchParams: (params: URLSearchParams) => void): void {
  const searchParams = new URLSearchParams(window.location.search)
  modifySearchParams(searchParams)
  const newURL = window.location.pathname + '?' + searchParams.toString()
  history.replaceState(null, '', newURL)
}

export function paramToURL (key: string, value: number | string): void {
  replaceState((searchParams) => {
    searchParams.set(`${key}`, `${value}`)
  })
}

export function addSoundToURL (refNum: number, soundEntry: SoundEntry): void {
  replaceState((searchParams) => {
    searchParams.set(`sound${refNum}`, soundEntry.soundName)
    searchParams.set(`track${refNum}`, `${soundEntry.trackNum}`)
    searchParams.set(`start${refNum}`, `${soundEntry.start}`)
  })
}

export function removeSoundFromURL (refNum: number): void {
  replaceState((searchParams) => {
    searchParams.delete(`sound${refNum}`)
    searchParams.delete(`track${refNum}`)
    searchParams.delete(`start${refNum}`)
  })
}

export function soundStateFromURL (): SoundState {
  const searchParams = new URLSearchParams(window.location.search)
  const soundState = new Map()
  for (const [key, value] of searchParams.entries()) {
    let refNum
    let paramName
    let paramValue
    refNum = key.split('sound')[1]
    if (refNum != null) {
      paramName = 'soundName'
      paramValue = value
    } else {
      refNum = key.split('track')[1]
      if (refNum != null) {
        paramName = 'trackNum'
        paramValue = Number(value)
      } else {
        refNum = key.split('start')[1]
        paramName = 'start'
        paramValue = Number(value)
      }
    }
    if (refNum != null) {
      refNum = Number(refNum)
      if (soundState.get(refNum) != null) {
        soundState.get(refNum)[paramName] = paramValue
      } else {
        const state: Record<string, number | string> = {}
        state[paramName] = paramValue
        soundState.set(refNum, state)
      }
    }
  }
  return soundState
}

export function playerStateFromURL (): PlayerState {
  const searchParams = new URLSearchParams(window.location.search)
  const state: PlayerState = {}
  for (const [key, value] of searchParams.entries()) {
    if (key === 'position') {
      state.position = Number(value)
    } else if (key === 'duration') {
      state.duration = Number(value)
    }
  }
  return state
}
