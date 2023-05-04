import { type SoundMenu } from '../elements/sound-menu'

interface Data {
  menu: SoundMenu
  initialY: number
  initialScrollTop: number
  previousTime: number
  previousY: number
  velocity: number | null
  downwards: boolean | null
  updateVelocity: (event: PointerEvent) => void
  pointerMove: (event: PointerEvent) => void
  pointerUp: (event: PointerEvent) => void
}

export default function scroll (event: PointerEvent): void {
  const menu = (event.target as HTMLElement).parentElement as SoundMenu
  const data: Data = {
    menu,
    initialY: event.pageY,
    initialScrollTop: menu.scrollTop,
    previousTime: Date.now(),
    previousY: event.pageY,
    velocity: null,
    downwards: null,
    updateVelocity: (event) => { updateVelocity(data, event) },
    pointerMove: (event) => { pointerMove(data, event) },
    pointerUp: (event) => { pointerUp(data, event) }
  }
  menu.setPointerCapture(event.pointerId)

  document.addEventListener('pointermove', data.pointerMove,
    { passive: true })
  document.addEventListener('pointerup', data.pointerUp)
  document.addEventListener('pointercancel', data.pointerUp)
}

function updateVelocity (data: Data, event: PointerEvent): void {
  const time = Date.now()
  const velocity = ((event.pageY - data.previousY) /
                      (time - data.previousTime))
  if (data.velocity !== null) { data.velocity = (velocity + data.velocity) / 2 } else { data.velocity = velocity }
  data.previousY = event.pageY
  data.previousTime = time
  data.downwards = data.initialY > event.pageY
}

function pointerMove (data: Data, event: PointerEvent): void {
  data.menu.scrollTop = data.initialScrollTop + data.initialY - event.pageY
  data.updateVelocity(event)
}

function pointerUp (data: Data, event: PointerEvent): void {
  document.removeEventListener('pointermove', data.pointerMove)
  document.removeEventListener('pointerup', data.pointerUp)
  document.removeEventListener('pointercancel', data.pointerUp)

  endInertia(data.menu, data.downwards, data.velocity)

  data.menu.releasePointerCapture(event.pointerId)
}

function endInertia (menu: HTMLElement, downwards: boolean | null, v: number | null, t0?: number, t?: number): void {
  if (v === null) {
    throw new Error('Null velocity in ending inertia')
  }
  if (downwards === null) {
    downwards = false
  }
  if (t !== undefined && t0 !== undefined) {
    const dt = t - t0
    if (dt < 0 || (downwards && (v > 0)) || (!downwards && (v < 0))) {
      menu.onclick = () => false
      return
    }
    menu.scrollTop -= dt * v
    v = (1 - 0.002 * dt) * v
  } else {
    // The inertial scroll can be stopped by clicking on the menu
    menu.onclick = () => { menu.onclick = null }
  }
  if (Math.abs(v) > 0.2 &&
        menu.scrollTop > 0 &&
        menu.scrollTop < (menu.scrollHeight - menu.offsetHeight) &&
        (menu.onclick != null)) {
    window.requestAnimationFrame(
      endInertia.bind(null, menu, downwards, v, t)
    )
  } else {
    menu.onclick = () => false
  }
}
