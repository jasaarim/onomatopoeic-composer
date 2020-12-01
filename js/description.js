async function showDescription(sound) {
    if (sound.files.description) {
        const descriptionElem = document.querySelector('#description');
        fetch(sound.files.description)
            .then(response => response.text())
            .then(text => descriptionElem.textContent = text);
    }
}


async function clearDescription(sound) {
    if (sound.files.description) {
        const descriptionElem = document.querySelector('#description');
        descriptionElem.textContent = null;
    }
}


export { showDescription, clearDescription };
