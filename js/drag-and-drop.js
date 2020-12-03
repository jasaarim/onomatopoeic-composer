import { soundToTrack } from './player-sounds.js';


function drag(sound, event) {
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
    clone.onpointerup = pointerUp;
    // This may be redundant
    clone.onpointercancel = pointerUp;

    // Bind for the event listener
    const clonePointerMove = pointerMove.bind(clone);
    // Reference for the removal of the listener
    clone.pointerMove = clonePointerMove;

    clonePointerMove(event);
    document.addEventListener('pointermove', clone.pointerMove);
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


export { drag };
