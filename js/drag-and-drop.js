import { soundToTrack } from './player-sounds.js';


function dragAfterTimeout(event, timeout) {
    let canceled;
    function cancel() {
        canceled = true;
    }
    document.addEventListener('pointerup', cancel);
    window.setTimeout(() => {
        document.removeEventListener('pointerup', cancel);
        if (!canceled)
            drag(event);
    }, timeout)
}


function drag(event) {
    event.preventDefault();
    // Does this work?
    // window.navigator.vibrate(200);
    const sound = event.target;
    const clone = sound.cloneNode(true);
    clone.classList.add('clone');
    document.body.append(clone);

    // We only need X to find out the position on the track
    clone.startX = event.pageX;
    clone.sound = sound;
    // Position of the pointer within the sound
    clone.shiftX = event.clientX - sound.getBoundingClientRect().left;
    clone.shiftY = event.clientY - sound.getBoundingClientRect().top;

    clone.leaveTrack = leaveTrack;
    clone.enterTrack = enterTrack;
    clone.drop = drop;

    // Bind for the event listener
    const clonePointerMove = pointerMove.bind(clone);
    const clonePointerUp = pointerUp.bind(clone);
    // References for the removal of the listener
    clone.pointerMove = clonePointerMove;
    clone.pointerUp = clonePointerUp;

    clonePointerMove(event);
    document.addEventListener('pointermove', clone.pointerMove);
    document.addEventListener('pointerup', clone.pointerUp);
    // This may be redundant
    document.addEventListener('pointercancel', clone.pointerUp);
}


function pointerMove(event) {
    this.style.left = event.pageX - this.shiftX;
    this.style.top = event.pageY - this.shiftY;

    this.style.visibility = 'hidden';
    let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    this.style.visibility = 'visible';

    const trackBelow = elemBelow.closest('.track');

    if (trackBelow != this.currentTrack) {
        this.leaveTrack();
        this.currentTrack = trackBelow;
        this.enterTrack();
    }
}


function enterTrack(track) {
    if (this.currentTrack)
        this.currentTrack.style.opacity = 0.6;
}


function leaveTrack(track) {
    if (this.currentTrack)
        this.currentTrack.style.opacity = null;
}


function pointerUp(event) {
    if (this.currentTrack)
        this.drop(event);
    document.removeEventListener('pointermove', this.pointerMove);
    document.removeEventListener('pointerup', this.pointerUp);
    document.removeEventListener('pointercancel', this.pointerUp);
    this.remove();
}


function drop(event) {
    const dx = event.pageX - this.startX;
    let position = dx / this.currentTrack.clientWidth * 100;
    if (this.sound.position)
        position += this.sound.position;
    soundToTrack(this.sound, this.currentTrack, position);
    this.leaveTrack();
}


export { dragAfterTimeout };
