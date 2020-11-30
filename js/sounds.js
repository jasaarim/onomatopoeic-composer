function populateSoundMenu() {
    const menu = document.querySelector('#sound-menu');
    processAllSounds(sound => menu.appendChild(sound));
}


function processAllSounds(process) {
    return fetchSoundNames()
        .then(sounds => {
            for (const name in sounds) {
                const sound = createSound(name, sounds[name]);
                process(sound);
            }
        })
}


function fetchSoundNames() {
    return fetch('/sounds.json')
        .then(response => response.json())
        .then(json => json['sounds'] )
}


function createSound(name, files) {
    const sound = document.createElement('div');
    const audio = files.audio ? createSoundAudio(name, files.audio) : null;
    const checkbox = createSoundCheckbox();
    const moveMenu = createSoundMoveMenu();

    sound.className = 'sound';
    sound.id = 'sound-' + name;
    sound.tabIndex = "0";
    sound.name = name;
    sound.audio = audio;
    sound.files = files;

    sound.appendChild(checkbox);
    if (audio) {
        sound.appendChild(audio);
    } else {
        sound.className += " no-audio";
        checkbox.disabled = true;
        moveMenu.disabled = true;
    }
    sound.appendChild(document.createTextNode(name));
    sound.appendChild(moveMenu);

    sound.onfocus = showDescription;
    sound.onblur = clearDescription;

    return sound
}


async function showDescription() {
    if (this.files.description) {
        const descriptionElem = document.querySelector('#description');
        fetch(this.files.description)
            .then(response => response.text())
            .then(text => descriptionElem.textContent = parseDescription(text));
    }
}


function parseDescription(text) {
    // TODO: Fix descriptions to get rid of decoding and splitting
    if (text.includes('txtSelitys=')) {
        text = text.split('txtSelitys=')[1];
    }
    return unescape(decodeURI(text))
}


async function clearDescription() {
    if (this.files.description) {
        const descriptionElem = document.querySelector('#description');
        descriptionElem.textContent = null;
    }
}

function createSoundAudio(name, source) {
    const audio = document.createElement('audio');

    audio.controls = false;
    audio.position = 0;
    audio.src = source;
    audio.preload = 'none';

    return audio;
}


function createSoundCheckbox() {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.onchange = audioCheckboxChange;
    return checkbox;
}


function audioCheckboxChange() {
    const audio = this.nextSibling;
    if (this.checked) {
        styleAudioControls(audio);
        audio.controls = true;
    } else {
        audio.style = {};
        audio.controls = false;
    }
}


function styleAudioControls(audio) {
    if (audio.position > 50) {
        audio.style.right = '100%';
        audio.style.left = null;
    } else {
        audio.style.left = '1.4rem';
        audio.style.right = null;
    }
};

function createSoundMoveMenu() {
    const tracks = document.querySelector('#sound-tracks');
    const len = tracks ? tracks.length : 0;
    const menu = document.createElement('select');
    let option = document.createElement('Option');
    menu.appendChild(option);
    for (let i = 1; i <= len; i++) {
        option = document.createElement('option');
        option.value = String(i);
        option.textContent = String(i);
        menu.appendChild(option);
    }
    option = document.createElement('option');
    option.value = String('*');
    option.textContent = String('*');
    menu.appendChild(option);

    menu.onchange = soundMenuMove;

    return menu
}


function soundMenuMove() {
    const sound = this.parentElement;
    const event = new CustomEvent('moveSound', {
        detail: { trackNumber: this.value, sound: sound }
    });
    document.querySelector('#sound-tracks').dispatchEvent(event);
    this.value = this.firstChild.textContent;
}


export { createSound, fetchSoundNames, processAllSounds, populateSoundMenu };
