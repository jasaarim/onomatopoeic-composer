export function initializeApp (lang: string, title: string): void {
  const html = document.querySelector('html')
  if (html !== null) {
    html.lang = lang
  }

  document.title = title
}

// FIXME: Translate only to Finnish or English
export function translate (key: term): string {
  const html = document.querySelector('html')
  const lang = (html != null) ? html.lang : 'fi'
  if (lang === 'fi') { return TRANSLATIONS[key] } else { return key }
}

type term = 'Loading sounds...' | 'Loading description...' | 'Start'

const TRANSLATIONS: Record<string, string> = {
  'Loading sounds...': 'Ladataan ääniä...',
  'Loading description...': 'Ladataan selitystä...',
  Start: 'Alku'
}
