import { getSoundTracks } from './player.js';
import { createSound } from './sounds.js';


async function createActiveSound(sound, target, position) {
    const newSound = createSound(sound.name, sound.files);

    newSound.move = moveSound;
    newSound.adjustWidth = adjustSoundWidth;
    newSound.move(target, position);

    // Initial width to be adjusted after the audio is fetched
    newSound.style.width = '5%';

    const tracks = getSoundTracks(target);
    const audioCxt = tracks.getAudioCxt();

    // TODO: Do we want to connect the audio element to Audio Context?
    //sound.audio.preload = 'auto';
    //connectAudioElement(sound.audio, audioCxt, target);

    newSound.audioBuffer = await createAudioBuffer(newSound.audio, audioCxt);
    newSound.adjustWidth(tracks);
    // TODO: Check for overlap and possibly move to another place

    return newSound
}


function moveSound(target, position) {
    this.id = `active-sound-${target.id}-${position}`;
    this.style.left = `${position}%`;
    this.position = position;
    target.appendChild(this);
}


function adjustSoundWidth(tracks) {
    if (this.audioBuffer) {
        const audioDuration = this.audioBuffer.buffer.duration;
        this.style.width = `${audioDuration / tracks.duration * 100}%`;
    } else {
        console.log("Cannot set width because audio buffer isn't ready");
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


function soundToTrack(sound, trackNumText) {
    if (sound.move && trackNumText == '*') {
        sound.remove();
    } else {
        const tracks = document.querySelector('#sound-tracks');
        const track = tracks.querySelector(`#track${trackNumText}`);
        const position = tracks.start / tracks.duration * 100;
        if (sound.move) {
            sound.move(track, position);
        } else {
            createActiveSound(sound, track, position);
        }
    }
}

export { createActiveSound, soundToTrack };
