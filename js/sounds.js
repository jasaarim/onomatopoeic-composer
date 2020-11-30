async function populateSoundMenu() {
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
        checkbox.style.visibility = 'hidden';
        moveMenu.disabled = true;
        moveMenu.style.visibility = 'hidden';
    }
    sound.appendChild(moveMenu);
    sound.appendChild(document.createTextNode(name));

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
    return checkbox;
}


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

    return menu
}


export { createSound, fetchSoundNames, processAllSounds, populateSoundMenu };
