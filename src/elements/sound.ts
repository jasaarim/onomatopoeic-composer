export interface Sound extends HTMLDivElement {
  audio?: HTMLAudioElement | null
  name: string
  addButton: HTMLButtonElement
  files: Files
  bufferSource: AudioBufferSourceNode
  buffer: AudioBuffer | null
  renewBufferSource: () => void
  stereoPanner?: StereoPannerNode
  panner?: PannerNode
}

export interface Files {
  description: string
  audio?: string
}

export function newSound (name: string, files: Files): Sound {
  const sound = document.createElement('div') as Sound
  const audio = (files.audio !== undefined) ? createSoundAudio(files.audio) : null
  const addButton = createAddButton(audio)
  const text = document.createElement('span')
  text.append(name)
  sound.className = 'sound'
  sound.id = 'sound-' + name
  sound.tabIndex = 0
  sound.name = name
  sound.audio = audio
  sound.addButton = addButton
  sound.files = files
  ;(audio != null) ? sound.append(audio) : sound.classList.add('no-audio')
  sound.append(addButton)
  sound.append(text)
  return sound
}

function createSoundAudio (source: string): HTMLAudioElement {
  const audio = document.createElement('audio')
  audio.controls = false
  audio.src = source
  audio.preload = 'none'
  return audio
}

function createAddButton (audio: HTMLAudioElement | null): HTMLButtonElement {
  const button = document.createElement('button')
  button.className = 'add-button'
  button.append(addButtonSvg())
  if (audio === null) { button.disabled = true }
  return button
}

function addButtonSvg (): SVGElement {
  const svgUri = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(svgUri, 'svg')
  svg.setAttribute('viewBox', '0 0 100 100')
  const polygonH = document.createElementNS(svgUri, 'polygon')
  polygonH.setAttribute('points', '0,60 100,60 100,40 0,40')
  const polygonV = document.createElementNS(svgUri, 'polygon')
  polygonV.setAttribute('points', '60,0 60,100 40,100 40,0')
  polygonV.setAttribute('class', 'plus-button')
  svg.append(polygonH, polygonV)
  return svg
}
