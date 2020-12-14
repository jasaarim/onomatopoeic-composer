import { play, stop, pause } from './player-controls.js';
import { soundToTrack } from './player-sounds.js';
import { Cursor } from './player-cursor.js';
import { showDescription } from './description.js';
import { dragScrollOrFocus } from './drag-and-drop.js';


window.addEventListener('DOMContentLoaded', (event) => {

    const cursor = new Cursor();

    const body = document.querySelector('body');
    const playButton = document.querySelector('#play-button');
    const stopButton = document.querySelector('#stop-button');
    const description = document.querySelector('#description');
    const soundMenu = document.querySelector('#sound-menu');
    const tracks = document.querySelector('#sound-tracks');

    playButton.addEventListener('click', (event) => {
        if (!playButton.parentElement.classList.contains('playing')) {
            play();
            playButton.parentElement.classList.add('playing');
            cursor.play();
        } else {
            pause();
            playButton.parentElement.classList.remove('playing');
            cursor.pause();
        }
    });

    stopButton.addEventListener('click', (event) => {
        stop();
        playButton.parentElement.classList.remove('playing');
        tracks.setStart(0);
        // This might once emit an animationend event, which would
        // click on the button again
        cursor.stop();
    });

    cursor.element.addEventListener('animationend', (event) => {
        stopButton.click();
    });

    tracks.addEventListener('click', event => {
        if (event.target.className == 'track' &&
            !playButton.parentElement.classList.contains('playing')) {
            const track = event.target;
            const x = event.clientX - track.getBoundingClientRect().left;
            const start = x / track.clientWidth * tracks.duration;
            tracks.setStart(start);
        }
    })

    document.addEventListener('keydown', event => {
        if (![13, 32, 37, 38, 39, 40].includes(event.keyCode))
            return
        let sound = document.activeElement;
        if (!sound.classList.contains('sound'))
            sound = null;
        if (sound &&
            !sound.classList.contains('no-audio') &&
            [13, 32].includes(event.keyCode)) {
            if (!description.classList.contains('playing'))
                description.play();
            else
                description.pause();
            event.preventDefault();
        } else if (sound &&
            sound.classList.contains('active') &&
            [37, 38, 39, 40].includes(event.keyCode)) {
            let position = sound.position;
            let track = sound.parentElement;
            if (event.keyCode == 39)
                position = Math.round(sound.position + 1);
            else if (event.keyCode == 37)
                position = Math.round(sound.position - 1);
            else if (event.keyCode == 38 &&
                     track.previousSibling &&
                     track.previousSibling.classList &&
                     track.previousSibling.classList.contains('track'))
                track = track.previousSibling;
            else if (event.keyCode == 40 &&
                     track.nextSibling &&
                     track.nextSibling.classList &&
                     track.nextSibling.classList.contains('track'))
                track = track.nextSibling;
            sound.move(track, position, true);
            sound.focus();
        } else if ([37, 39].includes(event.keyCode)) {
            let start = null;
            if (event.keyCode === 39)
                start = Math.min(tracks.start + 0.01 * tracks.duration,
                                 0.99 * tracks.duration);
            else if (event.keyCode === 37)
                start = Math.max(tracks.start - 0.01 * tracks.duration, 0);
            if ('null' != start)
                tracks.setStart(start)
        }
    })

    description.addEventListener('click', event => {
        if (event.target.id == 'description-play')
            if (!description.classList.contains('playing'))
                description.play();
            else
                description.pause();
    });

    body.addEventListener('click', event => {
        if (event.target.className == 'add-button') {
            const sound = event.target.parentElement;
            if (!sound.classList.contains('active'))
                soundToTrack(sound);
            else
                sound.remove();
        }
    });

    body.addEventListener('focusin', event => {
        if (event.target.classList.contains('sound')) {
            showDescription(event.target);
        }
    });

    body.addEventListener('pointerdown', event => {
        if (event.target.classList.contains('sound')
            && !event.target.classList.contains('no-audio')) {
            dragScrollOrFocus(event);
        }
    });

});
