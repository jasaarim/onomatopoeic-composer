const templateNodes: Record<string, Promise<DocumentFragment>> = {}

export function createShadow (name: string, element: HTMLElement, postAction: () => void, cache: boolean = true): void {
  function append (content: DocumentFragment): void {
    const shadow = element.attachShadow({ mode: 'open' })
    shadow.appendChild(content.cloneNode(true))
    postAction()
  }
  if (cache && templateNodes[name] !== undefined) {
    templateNodes[name].then((content) => {
      append(content)
    }).catch(error => { throw error })
  } else {
    let saveToCache = (_: DocumentFragment): void => { throw new Error('saveToCache used outside of Promise') }
    if (cache) {
      templateNodes[name] = new Promise((resolve) => {
        saveToCache = resolve
      })
    }
    fetch(`templates/${name}.html`)
      .then(async response => await response.text())
      .then(text => {
        const parser = new DOMParser()
        const nodes = parser.parseFromString(text, 'text/html')
        const content = (nodes.querySelector('template') as HTMLTemplateElement).content
        if (cache) {
          saveToCache(content)
        }
        append(content)
      })
      .catch((error) => { throw error })
  }
}

export function makeStyleNode (elementName: string): HTMLElement {
  const style = document.createElement('link')
  style.type = 'text/css'
  style.rel = 'stylesheet'
  style.href = `style/${elementName}.css`
  return style
}

export type numFun = () => number

export function funDummy (): any {
  throw new Error('Class parameters unset')
}

export function resolveDummy (): any {
  throw new Error('Function needs to be assigned resolve inside Promise')
}
