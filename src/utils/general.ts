export function parseTemplate (text: string): DocumentFragment {
  const parser = new DOMParser()
  const nodes = parser.parseFromString(text, 'text/html')
  const content = (nodes.querySelector('template') as HTMLTemplateElement).content
  return content
}

export async function fetchLocalized (base: string, ext: string = ''): Promise<string> {
  const lang = navigator.language.split('-')[0]
  let response
  if (config.languages?.includes(lang)) {
    response = await fetch(`${base}-${lang}${ext}`)
  }
  if (response == null || response.status === 404) {
    response = await fetch(`${base}${ext}`)
  }
  return await response.text()
}

export function funDummy (): any {
  throw new Error('Class parameters unset')
}

export function resolveDummy (): any {
  throw new Error('Function needs to be assigned resolve inside Promise')
}

interface ConfigJson {
  title: string
  languages: string[]
}

class Config {
  resolveLoaded: () => void
  loaded: Promise<void>
  title: string = ''
  languages: string[] = []

  constructor () {
    this.resolveLoaded = () => { throw new Error('Impossible!') }
    this.loaded = new Promise(resolve => {
      this.resolveLoaded = resolve
    })
    this.loadConfig().catch(error => { throw error })
  }

  async loadConfig (): Promise<void> {
    const response = await fetch('config.json')
    const config = await response.json() as ConfigJson
    this.title = config.title
    this.languages = config.languages
    this.resolveLoaded()
  }
}

export const config = new Config()
