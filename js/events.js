import { play, stop, pause } from './player-controls.js';
import { soundToTrack } from './player-sounds.js';
import { Cursor } from './player-cursor.js';
import { showDescription, clearDescription} from './description.js';
import { drag } from './drag-and-drop.js';


window.addEventListener('DOMContentLoaded', (event) => {

    const cursor = new Cursor();

    const body = document.querySelector('body');
    const playButton = document.querySelector('#play-button');
    const stopButton = document.querySelector('#stop-button');
    const soundMenu = document.querySelector('#sound-menu');
    const tracks = document.querySelector('#sound-tracks');
    const inputStart = document.querySelector('#input-start');
    const inputDuration = document.querySelector('#input-duration');

    playButton.addEventListener('click', (event) => {
        inputStart.disabled = true;
        inputDuration.disabled = true;
        if (playButton.textContent === 'Play') {
            play();
            playButton.textContent = 'Pause';
            cursor.play();
        } else {
            pause();
            playButton.textContent = 'Play';
            cursor.pause();
        }
    });

    stopButton.addEventListener('click', (event) => {
        playButton.textContent = 'Play';
        stop();
        tracks.setStart(0);
        inputStart.disabled = false;
        inputDuration.disabled = false;
        // This might once emit an animationend event, which would
        // click on the button again
        cursor.stop();
    });

    cursor.element.addEventListener('animationend', (event) => {
        stopButton.click();
    });

    inputStart.addEventListener('change', event => {
        const start = inputStart.value / 100 * tracks.duration;
        tracks.setStart(start);
    })

    inputDuration.addEventListener('change', event => {
        tracks.setDuration(inputDuration.value);
    })

    body.addEventListener('change', event => {
        if (event.target.parentElement.className == 'sound') {
            if (event.target.tagName == 'SELECT') {
                const select = event.target;
                const sound = event.target.parentElement;
                soundToTrack(sound, select.value);
                select.value = select.firstChild.textContent;
            } else if (event.target.tagName == 'INPUT') {
                event.target.toggleAudioControls();
            }
        }
    });

    body.addEventListener('focusin', event => {
        if (event.target.className.includes('sound')) {
            showDescription(event.target);
        }
    });

    body.addEventListener('focusout', event => {
        if (event.target.className.includes('sound')) {
            clearDescription(event.target);
        }
    });

    body.addEventListener('pointerdown', event => {
        if (event.target.className == 'sound')
            drag(event.target, event);
    });

});
