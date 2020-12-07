import { getSoundTracks } from './player.js';
import { createSound } from './sound-creation.js';


async function createActiveSound(sound, target, position) {
    const tracks = getSoundTracks(target);

    const newSound = createSound(sound.name, sound.files, tracks.length);

    newSound.move = moveSound;
    newSound.adjustWidth = adjustSoundWidth;
    newSound.noOverlap = noOverlap;

    newSound.move(target, position);

    // Initial width to be adjusted after the audio is fetched
    newSound.style.width = '5%';

    const audioCxt = tracks.getAudioCxt();

    newSound.bufferSource = await newBufferSource(sound, audioCxt);
    newSound.adjustWidth();
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
    if (this.bufferSource) {
        const tracks = this.parentNode.parentNode;
        const audioDuration = this.bufferSource.buffer.duration;
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


function connectBufferSource(bufferSource, audioCxt, target) {
    bufferSource.connect(audioCxt.destination);
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
