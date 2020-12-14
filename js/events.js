import { soundToTrack } from './sound-active.js';
import { dragScrollOrFocus } from './drag-and-drop.js';
import keyboardInteraction from './events-keyboard.js';


window.addEventListener('DOMContentLoaded', (event) => {

    const body = document.querySelector('body');
    const player = document.querySelector('#player');
    const cursor = document.querySelector('#player-cursor');
    const playerControls = document.querySelector('#player-controls');
    const description = document.querySelector('#description');
    const soundMenu = document.querySelector('#sound-menu');

    playerControls.playButton.addEventListener('click', (event) => {
        playerControls.play();
    });

    playerControls.stopButton.addEventListener('click', (event) => {
        playerControls.stop();
    });

    cursor.addEventListener('animationend', (event) => {
        playerControls.stopButton.click();
    });

    player.addEventListener('click', event => {
        if (event.target.className == 'track' &&
            !player.classList.contains('playing')) {
            const track = event.target;
            const x = event.clientX - track.getBoundingClientRect().left;
            const start = x / track.clientWidth * player.duration;
            player.setStart(start);
        }
    })

    document.addEventListener('keydown', event => {
        if ([13, 32, 37, 38, 39, 40].includes(event.keyCode))
            keyboardInteraction(event);
    })

    description.playButton.addEventListener('click', event => {
        description.play();
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
            description.show(event.target);
        }
    });

    body.addEventListener('pointerdown', event => {
        if (event.target.classList.contains('sound')
            && !event.target.classList.contains('no-audio')) {

            dragScrollOrFocus(event);
        }
    });

});
