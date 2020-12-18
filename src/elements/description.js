import { translate } from '../app.js';


async function initialize() {
    const description = document.querySelector('#description');

    description.playButton = description.querySelector('#description-play');

    description.prepareContent = prepareContent;
    description.show = show;
    description.clear = clear;
    description.play = play;
    description.pause = pause;
}


async function show(sound) {
    if (sound.files.description)
        if (description.soundName != sound.name) {
            const p = document.createElement('p');
            p.append(translate('Loading description...'));
            description.append(p);
            try {
                fetch(sound.files.description)
                    .then(response => response.text())
                    .then(text => description.prepareContent(sound, text));
            } finally {
                p.remove();
            }
        }
}


function prepareContent(sound, text) {
    this.clear();
    this.soundName = sound.name;
    const h = document.createElement('h3');
    h.append(sound.name.charAt(0).toUpperCase()
             + sound.name.slice(1));
    const p = document.createElement('p');
    p.append(text);
    this.text = [h, p];
    this.append(...this.text);
    if (sound.audio) {
        this.audio = sound.audio;
        this.audio.preload = 'auto';
        this.audio.onended = () => this.classList.remove('playing');
        this.classList.add('audio');
    }
}


function clear() {
    this.soundName = null;
    if (this.text) {
        for (const p of this.text)
            p.remove();
        this.text = null;
    }
    if (this.classList.contains('playing')) {
        this.pause();
        this.audio.currentTime = 0;
    }
    if (this.audio) {
        this.audio.onended = null;
        this.audio = null;
        this.classList.remove('audio');
    }
}


function play() {
    if (!this.classList.contains('playing')) {
        this.audio.play();
        this.classList.add('playing');
    } else {
        this.pause();
    }
}

function pause() {
    this.audio.pause();
    this.classList.remove('playing');
}


initialize();
