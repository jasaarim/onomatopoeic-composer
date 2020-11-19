import { play, stop, pause } from './player-controls.js';
import { Cursor } from './player.js';


window.addEventListener('DOMContentLoaded', (event) => {

    const cursor = new Cursor();
    const playButton = document.querySelector('#play-button');
    const stopButton = document.querySelector('#stop-button');

    playButton.addEventListener('click', (event) => {
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
        stop();
        playButton.textContent = 'Play';
        cursor.stop();
    });

    cursor.element.addEventListener('animationend', (event) => {
        stopButton.click();
    });
});
