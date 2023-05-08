export function parseTemplate (text: string): DocumentFragment {
  const parser = new DOMParser()
  const nodes = parser.parseFromString(text, 'text/html')
  const content = (nodes.querySelector('template') as HTMLTemplateElement).content
  return content
}

export function funDummy (): any {
  throw new Error('Class parameters unset')
}

export function resolveDummy (): any {
  throw new Error('Function needs to be assigned resolve inside Promise')
}
