export function initializeApp(lang: string, title: string) {
    const html = document.querySelector('html');
    if (html !== null) {
        html.lang = lang;
    }

    document.title = title;
}


// FIXME: Translate only to Finnish or English
export function translate(key: term) {
    const html = document.querySelector('html')
    const lang = html ? html.lang : 'fi';
    if (lang === 'fi')
        return TRANSLATIONS[key]
    else
        return key
}


type term = 'Loading sounds...' | 'Loading description...' | 'Start'


interface TRANSLATIONS {
    term: string
}


const TRANSLATIONS = {
    'Loading sounds...': 'Ladataan ääniä...',
    'Loading description...': 'Ladataan selitystä...',
    'Start': 'Alku',
};
