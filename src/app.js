export function initializeApp(lang, title) {
    const html = document.querySelector('html');
    html.lang = lang;

    document.title = title;
}


export function translate(key) {
    const lang = document.querySelector('html').lang;
    if (key in TRANSLATIONS && lang in TRANSLATIONS[key])
        return TRANSLATIONS[key][lang]
    else
        return key
}


const TRANSLATIONS = {
    'Loading sounds...': {
        'fi': 'Ladataan ääniä...'
    },
    'Loading description...': {
        'fi': 'Ladataan selitystä...'
    },
    'Start': {
        'fi': 'Alku'
    }
};
