import { fetchLocalized, parseTemplate, config } from '../utils/general'

import template from '../templates/general-controls.html'
import '../style/general-controls.css'

const nodes = parseTemplate(template)

export class GeneralControls extends HTMLElement {
  infoOverlay: HTMLDivElement
  infoContainer: HTMLDivElement
  infoToggle: HTMLButtonElement
  fullscreenToggle: HTMLButtonElement

  constructor () {
    super()
    this.appendChild(nodes.cloneNode(true))

    this.infoOverlay = this.querySelector('#info-overlay') as HTMLDivElement
    this.infoToggle = this.querySelector('#info-toggle') as HTMLButtonElement
    this.fullscreenToggle = this.querySelector('#fullscreen-toggle') as HTMLButtonElement

    this.infoContainer = document.createElement('div')
    this.infoOverlay.append(this.infoContainer)

    this.prepareInfo().catch(error => { throw error })

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

  async prepareInfo (): Promise<void> {
    // Clear the container
    this.infoContainer.textContent = ''
    await this.prepareInfoTitle()
    const text = await fetchLocalized('info', '.txt')
    text.split('\n\n').forEach(paragraph => {
      const p = document.createElement('p')
      p.innerHTML = paragraph
      this.infoContainer.append(p)
    })
  }

  async prepareInfoTitle (): Promise<void> {
    await config.loaded
    const h = document.createElement('h1')
    h.append(config.title)
    this.infoContainer.append(h)
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
