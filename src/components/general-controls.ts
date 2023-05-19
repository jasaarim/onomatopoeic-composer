import { parseTemplate } from '../utils/general'

import template from '../templates/general-controls.html'
import '../style/general-controls.css'

const nodes = parseTemplate(template)

export class GeneralControls extends HTMLElement {
  infoOverlay: HTMLDivElement
  infoToggle: HTMLButtonElement
  fullscreenToggle: HTMLButtonElement

  constructor () {
    super()
    this.appendChild(nodes.cloneNode(true))

    this.infoOverlay = this.querySelector('#info-overlay') as HTMLDivElement
    this.infoToggle = this.querySelector('#info-toggle') as HTMLButtonElement
    this.fullscreenToggle = this.querySelector('#fullscreen-toggle') as HTMLButtonElement

    this.connectEvents()
  }

  connectEvents (): void {
    this.infoToggle.addEventListener('click', () => { this.toggleInfo() })
    if (this.fullsceenAvailable) {
      this.fullscreenToggle.addEventListener('click', () => { this.toggleFullscreen() })
    } else {
      this.classList.add('no-fullscreen')
    }
  }

  toggleInfo (): void {
    if (this.classList.contains('show-info')) {
      this.classList.remove('show-info')
      this.infoToggle.classList.remove('active')
    } else {
      this.classList.add('show-info')
      this.infoToggle.classList.add('active')
    }
  }

  /**
   * Put the whole page into fullscreen
   *
   * The webkit prefixed methods are added for iOS, but they don't
   * seem to work on iPhone.  They should work on iPad, but I haven't
   * had a chance to test it.  However, Chromium based browsers have
   * both, webkit prefixed and prefixless, methods so they end up
   * calling the prefixed ones.
   */
  toggleFullscreen (): void {
    if (this.fullscreenToggle.classList.contains('active')) {
      if ((document as any).webkitExitFullscreen != null) {
        (document as any).webkitExitFullscreen()
      } else {
        document.exitFullscreen().catch(error => {
          document.querySelector('body')?.append('error')
          throw error
        })
      }
      this.fullscreenToggle.classList.remove('active')
    } else {
      const doc = document.documentElement
      if ((doc as any).webkitRequestFullscreen != null) {
        (doc as any).webkitRequestFullscreen()
      } else {
        doc.requestFullscreen().catch((error) => { throw error })
      }
      this.fullscreenToggle.classList.add('active')
    }
  }

  get fullsceenAvailable (): boolean {
    const doc = document.documentElement
    return doc.requestFullscreen != null || (doc as any).webkitRequestFullscreen != null
  }
}

customElements.define('general-controls', GeneralControls)
