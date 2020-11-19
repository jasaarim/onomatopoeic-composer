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
    const sound = document.createElement("div");
    const audio = createSoundAudio(name, source);
    const checkbox = createSoundCheckbox();

    sound.className = 'sound';
    sound.id = 'sound-' + name;
    sound.audio = audio;

    sound.appendChild(checkbox);
    sound.appendChild(audio);
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
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
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
        audio.style.right = "100%";
    } else {
        audio.style.left = "1.4rem";
    }
};


export { createSound, fetchSoundNames, processAllSounds, populateSoundMenu };
