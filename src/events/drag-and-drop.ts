import { type Sound } from '../elements/sound.js'
import soundDrag from './sound-drag.js'
import soundMenuScroll from './sound-menu-scroll.js'

interface Data {
  noDrag: boolean
  initialY: number
  sound: Sound
  removeListeners: () => void
  pointerMove: (event: PointerEvent) => void
  pointerUp: (event: PointerEvent) => void
}

export default function dragScrollOrFocus (event: PointerEvent): void {
  const data: Data = {
    noDrag: false,
    initialY: event.pageY,
    sound: (event.target as HTMLElement).closest('.sound') as Sound,
    removeListeners: () => { removeListeners(data) },
    pointerMove: (event) => { maybeScroll(data, event) },
    pointerUp: (event) => { maybeFocus(data, event) }
  }

  document.addEventListener('pointermove', data.pointerMove,
    { passive: true })
  document.addEventListener('pointerup', data.pointerUp)
  document.addEventListener('pointercancel', data.pointerUp)

  const mouseEvent = event.pointerType === 'mouse'
  const timeOut = (mouseEvent && (event.target === data.sound)) ? 100 : 200

  window.setTimeout(() => {
    if (!data.noDrag) {
      data.removeListeners()
      soundDrag(event)
      if (mouseEvent) { data.sound.focus() }
    }
  }, timeOut)
}

function maybeFocus (data: Data, event: PointerEvent): void {
  data.noDrag = true
  data.removeListeners()
  if (!dragThreshold(event, data.initialY, data.sound)) {
    if ((event.target as HTMLElement).className !== 'add-button') { data.sound.focus() }
  }
}

function maybeScroll (data: Data, event: PointerEvent): void {
  if (dragThreshold(event, data.initialY, data.sound)) {
    data.noDrag = true
    data.removeListeners()
    soundMenuScroll(event)
  }
}

function dragThreshold (event: PointerEvent, initialY: number, sound: Sound): boolean {
  const soundHeight = sound.clientHeight
  return Math.abs(event.pageY - initialY) > (0.5 * soundHeight)
}

function removeListeners (data: Data): void {
  document.removeEventListener('pointerup', data.pointerUp)
  document.removeEventListener('pointercancel', data.pointerUp)
  document.removeEventListener('pointermove', data.pointerMove)
}
