async function populateSoundMenu() {
    const menu = document.querySelector('#sound-menu');
    menu.append('Loading sound words...');
    try {
        await createAllSounds().then(sounds => menu.append(...sounds));
    } catch {
        menu.append('Loading sound words failed!')
    } finally {
        menu.firstChild.remove();
    }
}


function createAllSounds() {
    return fetchSoundNames()
        .then(entries =>
              Object.keys(entries).map(name => createSound(name, entries[name])))
}


function fetchSoundNames() {
    return fetch('/sounds.json').then(response => response.json())
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

    const children = []
    children.push(checkbox);
    if (audio) {
        checkbox.audio = audio;
        children.push(audio);
    } else {
        sound.className += ' no-audio';
        checkbox.disabled = true;
        checkbox.style.visibility = 'hidden';
        moveMenu.disabled = true;
        moveMenu.style.visibility = 'hidden';
    }
    children.push(moveMenu);
    children.push(name);
    sound.append(...children);

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
    checkbox.toggleAudioControls = toggleAudioControls;
    return checkbox;
}


function toggleAudioControls() {
    if (this.checked) {
        if (this.parentElement.position > 50) {
            this.audio.style.right = '100%';
            this.audio.style.left = null;
        } else {
            this.audio.style.left = '1.4rem';
            this.audio.style.right = null;
        }
        this.audio.controls = true;
    } else {
        this.audio.style = {};
        this.audio.controls = false;
    }
}


function createSoundMoveMenu() {
    const tracks = document.querySelector('#sound-tracks');
    const len = tracks ? tracks.length : 0;
    const menu = document.createElement('select');
    let options = [document.createElement('option')];
    let option;
    for (let i = 1; i <= len; i++) {
        option = document.createElement('option');
        option.value = String(i);
        option.textContent = String(i);
        options.push(option);
    }
    option = document.createElement('option');
    option.value = '*';
    option.textContent = '*';
    options.push(option);
    menu.append(...options);

    return menu
}


export { createSound, createAllSounds, populateSoundMenu };
