import { translate } from '../app.js';
import { type Sound } from './sound.js';

export interface Description extends HTMLElement {
    playButton: HTMLButtonElement | null,
    prepareContent: (sound: Sound, text: string) => void,
    show: (sound: Sound) => Promise<void>,
    clear: () => void,
    pause: () => void,
    play: () => void,

    soundName: string | null,
    text: HTMLElement[] | null,
    audio: HTMLAudioElement | null,

}


async function initialize() {
    const description = document.querySelector('#description') as Description;

    description.playButton = description.querySelector('#description-play');

    description.prepareContent = (sound, text) => prepareContent(description, sound, text);
    description.show = (sound) => show(description, sound);
    description.clear = () => clear(description);
    description.play = () => play(description);
    description.pause = () => pause(description);
}


async function show(description: Description, sound: Sound) {
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


function prepareContent(description: Description, sound: Sound, text: string): void {
    description.clear();
    description.soundName = sound.name;
    const h = document.createElement('h3');
    h.append(sound.name.charAt(0).toUpperCase()
             + sound.name.slice(1));
    const p = document.createElement('p');
    p.append(text);
    description.text = [h, p];
    description.append(...description.text);
    if (sound.audio) {
        description.audio = sound.audio;
        description.audio.preload = 'auto';
        description.audio.onended = () => description.classList.remove('playing');
        description.classList.add('audio');
    }
}


function clear(description: Description) {
    description.soundName = null;
    if (description.text) {
        for (const p of description.text)
            p.remove();
        description.text = null;
    }
    if (description.classList.contains('playing')) {
        description.pause();
        if (description.audio === null) {
            throw new Error('description audio null at clear')
        }
        description.audio.currentTime = 0;
    }
    if (description.audio) {
        description.audio.onended = null;
        description.audio = null;
        description.classList.remove('audio');
    }
}


function play(description: Description): void {
    if (!description.classList.contains('playing')) {
        if (description.audio === null) {
            throw new Error('description audio null at play')
        }
        description.audio.play();
        description.classList.add('playing');
    } else {
        description.pause();
    }
}

function pause(description: Description): void {
    if (description.audio === null) {
        throw new Error('description audio null at pause')
    }
    description.audio.pause();
    description.classList.remove('playing');
}


initialize();
