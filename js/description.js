async function showDescription(sound) {
    if (sound.files.description) {
        const descriptionElem = document.querySelector('#description');
        fetch(sound.files.description)
            .then(response => response.text())
            .then(text => descriptionElem.textContent = parseDescription(text));
    }
}


function parseDescription(text) {
    // TODO: Fix descriptions to get rid of decoding and splitting
    if (text.includes('txtSelitys=')) {
        text = text.split('txtSelitys=')[1];
    }
    try {
        text = unescape(decodeURI(text));
    } catch {
        text = unescape(text);
    }
    return text;
}


async function clearDescription(sound) {
    if (sound.files.description) {
        const descriptionElem = document.querySelector('#description');
        descriptionElem.textContent = null;
    }
}


export { showDescription, clearDescription };
