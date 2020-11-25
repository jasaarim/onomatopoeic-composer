import { play, stop, pause } from './player-controls.js';
import { createActiveSound } from './player-sounds.js';
import { Cursor } from './player-cursor.js';


window.addEventListener('DOMContentLoaded', (event) => {

    const cursor = new Cursor();
    const playButton = document.querySelector('#play-button');
    const stopButton = document.querySelector('#stop-button');
    const soundMenu = document.querySelector('#sound-menu');
    const tracks = document.querySelector('#sound-tracks');

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
        tracks.setStart(0);
        // This might emit an animationend event, which will click on
        // the button again
        cursor.stop();
    });

    cursor.element.addEventListener('animationend', (event) => {
        stopButton.click();
    });

    tracks.addEventListener('moveSound', (event) => {
        const sound = event.detail.sound;
        const trackNum = event.detail.trackNumber;
        const track = tracks.querySelector(`#track${trackNum}`);
        const position = tracks.start / tracks.duration * 100;
        if (sound.move) {
            sound.move(track, position);
        } else {
            createActiveSound(sound, track, position);
        }
    })

});
