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


function createSound(name, source) {
    const sound = document.createElement('div');
    const audio = createSoundAudio(name, source);
    const checkbox = createSoundCheckbox();
    const moveMenu = createSoundMoveMenu();

    sound.className = 'sound';
    sound.id = 'sound-' + name;
    sound.name = name;
    sound.audio = audio;

    sound.appendChild(checkbox);
    sound.appendChild(audio);
    sound.appendChild(document.createTextNode(name));
    sound.appendChild(moveMenu);

    return sound
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
    } else {
        audio.style.left = '1.4rem';
    }
};

function createSoundMoveMenu() {
    const menu = document.createElement('select');
    let option = document.createElement('Option');
    menu.appendChild(option);
    for (let i = 1; i < 9; i++) {
        option = document.createElement('option');
        option.value = String(i);
        option.textContent = String(i);
        menu.appendChild(option);
    }

    menu.onchange = () => soundMove(menu);

    return menu
}


function soundMove(menu) {
    const sound = menu.parentElement;
    const event = new CustomEvent('moveSound', {
        detail: { trackNumber: menu.value, sound: sound }
    });
    document.querySelector('#sound-tracks').dispatchEvent(event);
    menu.value = menu.firstChild.textContent;
}


export { createSound, fetchSoundNames, processAllSounds, populateSoundMenu };
