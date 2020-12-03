import { getSoundTracks } from './player.js';
import { createSound } from './sound-creation.js';


async function createActiveSound(sound, target, position) {
    const tracks = getSoundTracks(target);

    const newSound = createSound(sound.name, sound.files, tracks.length);

    newSound.move = moveSound;
    newSound.adjustWidth = adjustSoundWidth;

    newSound.move(target, position);

    // Initial width to be adjusted after the audio is fetched
    newSound.style.width = '5%';

    const audioCxt = tracks.getAudioCxt();

    // TODO: Do we want to connect the audio element to Audio Context?
    //sound.audio.preload = 'auto';
    //connectAudioElement(sound.audio, audioCxt, target);

    newSound.audioBuffer = await createAudioBuffer(newSound.audio, audioCxt);
    newSound.adjustWidth();

    newSound.noOverlap = noOverlap;
    newSound.noOverlap();

    return newSound
}


function moveSound(target, position) {
    this.position = position;
    this.id = `active-sound-${target.id}-${this.position}`;
    this.style.left = `${this.position}%`;
    target.appendChild(this);
    if (this.noOverlap) this.noOverlap();
}


function adjustSoundWidth() {
    if (this.audioBuffer) {
        const tracks = this.parentNode.parentNode;
        const audioDuration = this.audioBuffer.buffer.duration;
        const width = audioDuration / tracks.duration * 100;
        this.width = width;
        this.style.width = `${this.width}%`;
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
                this.move(this.parentNode, elemEnd)
                break;
            }
        }
    }
}


function fetchAudioBuffer(src, audioCxt) {
    return fetch(src)
        .then(response => response.arrayBuffer())
        .then(data => audioCxt.decodeAudioData(
            data,
            (buffer) => buffer,
            (error) => console.log("Error decoding: " + error.err)
        ))
}


function createAudioBuffer(audioElement, audioCxt) {
    return fetchAudioBuffer(audioElement.src, audioCxt)
        .then(buffer => newBufferSource(buffer, audioCxt));
}


function newBufferSource(buffer, audioCxt) {
    const source = audioCxt.createBufferSource();
    source.buffer = buffer;
    connectAudioBuffer(source, audioCxt);
    source.renew = () => newBufferSource(buffer, audioCxt);
    return source;
}


function connectAudioBuffer(audioBuffer, audioCxt, target) {
    audioBuffer.connect(audioCxt.destination);
}


function connectAudioElement(audio, audioCxt, target) {
    // TODO: Use target to define panning
    const source = audioCxt.createMediaElementSource(audio);
    // TODO: The max delay time should be updated later
    const delayNode = audioCxt.createDelay(10);
    // We update the delay time once the player starts playing
    delayNode.delayTime.value = 0;
    source.connect(delayNode).connect(audioCxt.destination);
    // For updating the delay time (and max delay time) later
    audio.delayNode = delayNode;
    audio.setDelay = () => {
        audio.delayNode.delayTime.value = audioStart(audio)
    }
    audio.unsetDelay = () => { audio.delayNode.delayTime.value = 0; };
}


function soundToTrack(sound, track, position) {
    if (sound.move && track == '*') {
        sound.remove();
    } else {
        const tracks = document.querySelector('#sound-tracks');
        if (typeof(track) == 'string') {
            track = tracks.querySelector(`#track${track}`);
        }
        if (!position)
            position = tracks.start / tracks.duration * 100;
        if (sound.move) {
            sound.move(track, position);
        } else {
            createActiveSound(sound, track, position);
        }
    }
}


export { createActiveSound, soundToTrack };
