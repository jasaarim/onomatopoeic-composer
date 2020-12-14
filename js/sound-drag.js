import { soundToTrack } from './player-sounds.js';


function drag(event) {
    try { window.navigator.vibrate(50); } catch {}
    const tracks = document.querySelector('#sound-tracks');
    const sound = event.target;
    sound.setPointerCapture(event.pointerId)
    const clone = sound.cloneNode(true);
    clone.classList.add('clone');
    document.body.append(clone);

    // We only need X to find out the position on the track
    clone.startX = event.pageX;
    clone.sound = sound;
    // Position of the pointer within the sound
    clone.shiftX = event.clientX - sound.getBoundingClientRect().left;
    clone.shiftY = event.clientY - sound.getBoundingClientRect().top;

    if (sound.buffer)
        clone.style.width = (sound.buffer.duration / tracks.duration
                             * tracks.clientWidth);
    clone.leaveTrack = leaveTrack;
    clone.enterTrack = enterTrack;
    clone.drop = drop;
    clone.positionOnTrack = positionOnTrack;

    // Bind for the event listeners
    clone.pointerMove = pointerMove.bind(clone);
    clone.pointerUp = pointerUp.bind(clone)

    clone.pointerMove(event);
    document.addEventListener('pointermove', clone.pointerMove);
    document.addEventListener('pointerup', clone.pointerUp);
    document.addEventListener('pointercancel', clone.pointerUp);
}


function pointerMove(event) {
    if (this.currentTrack) {
        this.style.left = `${this.positionOnTrack(event)}%`;
        this.style.top = 0;
    } else {
        this.style.left = event.pageX - this.shiftX;
        this.style.top = event.pageY - this.shiftY;
    }

    this.style.visibility = 'hidden';
    let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    this.style.visibility = 'visible';

    const trackBelow = elemBelow.closest('.track');

    if (trackBelow != this.currentTrack) {
        this.leaveTrack(event);
        this.currentTrack = trackBelow;
        this.enterTrack(event);
    }
}


function enterTrack(event) {
    if (this.currentTrack) {
        this.currentTrack.append(this);
        this.currentTrack.style.opacity = 0.7;
    }
}

function leaveTrack(event) {
    if (this.currentTrack) {
        document.body.append(this);
        this.currentTrack.style.opacity = null;
    }
}


function pointerUp(event) {
    if (this.currentTrack)
        this.drop(event);
    else if (this.sound.classList.contains('active'))
        this.sound.remove();
    document.removeEventListener('pointermove', this.pointerMove);
    document.removeEventListener('pointerup', this.pointerUp);
    document.removeEventListener('pointercancel', this.pointerUp);
    this.remove();
}


function drop(event) {
    const position = this.positionOnTrack(event);
    soundToTrack(this.sound, this.currentTrack, position);
    this.leaveTrack(event);
}

function positionOnTrack(event) {
    const dx = event.pageX - this.startX;
    let position = dx / this.currentTrack.clientWidth * 100;
    if (this.sound.position)
        position += this.sound.position;
    return position
}

export default drag;
