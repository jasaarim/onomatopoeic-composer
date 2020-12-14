import { getSoundTracks } from './player.js';
import { createSound } from './sound-creation.js';


async function createActiveSound(sound, target, position) {
    const tracks = getSoundTracks(target);

    const newSound = createSound(sound.name, sound.files);
    newSound.classList.add('active');
    newSound.move = moveSound;
    newSound.endTime = endTime;
    newSound.adjustWidth = adjustSoundWidth;
    newSound.noOverlap = noOverlap;
    newSound.setPan = setPan;

    newSound.move(target, position);
    // Set the initial width and remove the class after width adjustment
    newSound.classList.add('clone');

    const audioCxt = tracks.getAudioCxt();

    newSound.bufferSource = await newBufferSource(sound, audioCxt);
    newSound.buffer = newSound.bufferSource.buffer;
    newSound.setPan();
    newSound.adjustWidth(true);
    newSound.classList.remove('clone');
    newSound.noOverlap();

    return newSound
}


function moveSound(target, position, checkForOverlap) {
    const tracks = target.parentElement;
    this.position = position;
    this.id = `active-sound-${target.id}-${this.position}`;
    this.style.left = `${this.position}%`;
    target.append(this);
    if (checkForOverlap && this.noOverlap) {
        this.noOverlap();
    }
    if (this.endTime() > tracks.duration) {
        tracks.setDuration(tracks.audioEnd());
    }
    this.setPan();
}


function endTime() {
    const tracks = this.parentElement.parentElement;
    return (this.position + this.width) / 100 * tracks.duration;
}


function adjustSoundWidth(setDuration) {
    if (this.bufferSource) {
        const tracks = this.parentNode.parentNode;
        const audioDuration = this.bufferSource.buffer.duration;
        const width = audioDuration / tracks.duration * 100;
        this.width = width;
        this.style.width = `${this.width}%`;
        if (setDuration && tracks.audioEnd() > tracks.duration)
            tracks.setDuration(tracks.audioEnd());
    } else {
        console.log("Cannot set width because audio buffer isn't ready");
    }
}


function noOverlap() {
    const position = this.position;
    const end = this.position + this.width;
    for (const elem of this.parentNode.children) {
        if (elem != this) {
            const elemEnd = elem.position + elem.width;
            if ((elem.position >= position && elem.position < end) ||
                (elemEnd > position && elemEnd < end) ||
                (position >= elem.position && position < elemEnd)) {
                this.move(this.parentNode, elemEnd, true)
                break;
            }
        }
    }
}


async function newBufferSource(sound, audioCxt) {
    const source = audioCxt.createBufferSource();
    if (sound.buffer) {
        source.buffer = sound.buffer;
    } else {
        await fetchAudioBuffer(sound.audio.src, audioCxt, source);
        // On iOS Safari there seems to be no way of knowing when the
        // audio data is decoded, hence the following check.
        let waits = 50;
        while (waits && !source.buffer) {
            await new Promise(r => setTimeout(r, 100));
            waits--;
        }
        sound.buffer = source.buffer;
    }
    connectBufferSource(source, audioCxt);
    source.renew = () => newBufferSource({buffer: source.buffer}, audioCxt);
    return source;
}


function fetchAudioBuffer(src, audioCxt, bufferSource) {
    return fetch(src)
        .then(response =>  response.arrayBuffer())
        .then(data => audioCxt.decodeAudioData(
            data,
            (buffer) => bufferSource.buffer = buffer,
            (error) => console.error('Error decoding: ' + error.err)
        ))
}


function connectBufferSource(bufferSource, audioCxt) {
    let panner;
    if (audioCxt.createStereoPanner) {
        panner = audioCxt.createStereoPanner();
        bufferSource.stereoPanner = panner;
    }
    else {
        panner = audioCxt.createPanner();
        panner.panningModel = 'equalpower';
        bufferSource.panner = panner;
    }
    bufferSource.connect(panner);
    panner.connect(audioCxt.destination);
}

function setPan() {
    const track = this.parentElement;
    const value = track.panValue;
    if (this.bufferSource) {
        if (this.bufferSource.stereoPanner)
            this.bufferSource.stereoPanner.pan.value = value;
        else if (this.bufferSource.panner)
            this.bufferSource.panner.setPosition(value, 0, 1 - Math.abs(value));
    }
}


function soundToTrack(sound, track, position) {
    const tracks = document.querySelector('#sound-tracks');
    if (!track) {
        track = tracks.getATrack();
        position = position || track.audioEnd / tracks.duration * 100;
    }
    if (!position)
        position = tracks.start / tracks.duration * 100;
    if (sound.move)
        sound.move(track, position, true);
    else
        createActiveSound(sound, track, position);
}


export { createActiveSound, soundToTrack };
