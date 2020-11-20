import { getSoundTracks } from './player.js';
import { createSound } from './sounds.js';


async function createActiveSound(name, source, target, position) {
    const sound = createSound(name, source);

    sound.move = (target, position) => moveSound(sound, target, position);
    sound.move(target, position);

    // Initial width to be adjusted after the audio is fetched
    sound.style.width = '5%';

    const tracks = getSoundTracks(target);
    const audioCxt = tracks.getAudioCxt();

    // TODO: Do we want to connect the audio element to Audio Context?
    //sound.audio.preload = 'auto';
    //connectAudioElement(sound.audio, audioCxt, target);

    sound.audioBuffer = await createAudioBuffer(sound.audio, audioCxt);

    sound.adjustWidth = () => adjustSoundWidth(sound, tracks);
    sound.adjustWidth();

    // TODO: Check for overlap and possibly move to another place

    return sound
}


function moveSound(sound, target, position) {
    sound.id = `active-sound-${target.id}-${position}`;
    sound.style.left = `${position}%`;
    sound.position = position;
    target.appendChild(sound);
}


function adjustSoundWidth(sound, tracks) {
    const audioDuration = sound.audioBuffer.buffer.duration;
    sound.style.width = `${audioDuration / tracks.getDuration() * 100}%`;
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


export { createActiveSound };
