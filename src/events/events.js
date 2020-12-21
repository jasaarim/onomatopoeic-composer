import soundToTrack from '../elements/sound-active.js';
import dragScrollOrClick from './drag-and-drop.js';
import keyboardInteraction from './events-keyboard.js';


const player = document.querySelector('#player');
const cursor = document.querySelector('#player-cursor');
const playerControls = document.querySelector('#player-controls');
const playButton = document.querySelector('#play-button');
const stopButton = document.querySelector('#stop-button');
const description = document.querySelector('#description');
const descriptionPlayButton = document.querySelector('#description-play');
const soundMenu = document.querySelector('#sound-menu');

// Due to the hiding/showing address bar in some mobile browsers
// the vh unit is not consistent with the visible page size.  This should
// fix it.
function resizeVh() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('DOMContentLoaded', resizeVh);
window.addEventListener('resize', resizeVh);


playButton.addEventListener('click', (event) => {
    playerControls.play();
});


stopButton.addEventListener('click', (event) => {
    playerControls.stop();
});


cursor.addEventListener('animationend', (event) => {
    stopButton.click();
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


descriptionPlayButton.addEventListener('click', event => {
    description.play();
});


document.body.addEventListener('click', event => {
    if (event.target.className == 'add-button') {
        const sound = event.target.parentElement;
        if (!sound.classList.contains('active'))
            soundToTrack(sound);
        else
            sound.remove();
    }
});


document.body.addEventListener('focusin', event => {
    if (event.target.classList.contains('sound')) {
        description.show(event.target);
    }
});


document.body.addEventListener('pointerdown', event => {
    const sound = event.target.closest('.sound');
    if (sound && !sound.classList.contains('no-audio')) {
        dragScrollOrClick(event);
    }
}, {'passive': true});
