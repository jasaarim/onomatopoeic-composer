import { newSound, type Sound } from './sound.js';
import { type Player } from './player.js'
import { type Track } from './track.js'


export interface ActiveSound extends Sound {
    player: Player,
    track: Track,
    move: (track: Track, position: number, checkForOverLap?: boolean) => void,
    endTime: () => number,
    adjustWidth: (setDuration?: boolean) => void,
    noOverlap: () => void,
    setPan: () => void,
    position: number,
    width: number,
}


export function soundToTrack(sound: ActiveSound, track?: Track | null, position?: number) {
    const player = document.querySelector('#player') as Player;
    if (track === null || track === undefined) {
        track = player.getATrack();
        position = position || track.audioEnd() as number / player.duration * 100;
    }
    if (!position)
        position = player.start / player.duration * 100;
    if (sound.move)
        sound.move(track, position, true);
    else
        newActiveSound(sound, track, position);
}


async function newActiveSound(sound: Sound, target: Track, position: number) {
    const player = document.querySelector('#player') as Player;

    const activeSound = newSound(sound.name, sound.files) as ActiveSound;
    activeSound.classList.add('active');
    // Set the initial width and remove the class after width adjustment
    activeSound.classList.add('initial');
    activeSound.player = player;

    activeSound.move = (track, position, checkForOverLap) => moveSound(activeSound, track, position, checkForOverLap);
    activeSound.endTime = () => endTime(activeSound);
    activeSound.adjustWidth = (setDuration?) => adjustSoundWidth(activeSound, setDuration);
    activeSound.noOverlap = () => noOverlap(activeSound);
    activeSound.setPan = () => setPan(activeSound);

    activeSound.move(target, position);
    const audioCxt = player.getAudioCxt();

    activeSound.bufferSource = await newBufferSource(activeSound, audioCxt);
    activeSound.buffer = activeSound.bufferSource.buffer;
    activeSound.renewBufferSource = () => renewBufferSource(activeSound, audioCxt);
    activeSound.setPan();
    activeSound.adjustWidth(true);
    activeSound.classList.remove('initial');
    activeSound.noOverlap();

    return newSound
}


function moveSound(activeSound: ActiveSound, target: Track, position: number, checkForOverlap?: boolean) {
    if (activeSound.track !== undefined) {
        activeSound.track.activeSounds = activeSound.track.activeSounds.filter(item => item !== activeSound)
    }
    activeSound.position = position;
    activeSound.id = `active-sound-${target.id}-${activeSound.position}`;
    activeSound.style.left = `${activeSound.position}%`;
    target.append(activeSound);
    target.activeSounds.push(activeSound)
    activeSound.track = target
    if (checkForOverlap && activeSound.noOverlap) {
        activeSound.noOverlap();
    }
    if (activeSound.endTime() > activeSound.player.duration) {
        const audioEnd = activeSound.player.audioEnd();
        if (audioEnd === null) {
            throw new Error('null audio end')
        }
        activeSound.player.setDuration(audioEnd);
    }
    activeSound.setPan();
}


function endTime(activeSound: ActiveSound): number {
    return (activeSound.position + activeSound.width) / 100 * activeSound.player.duration;
}


function adjustSoundWidth(activeSound: ActiveSound, setDuration?: boolean) {
    if (activeSound.bufferSource) {
        const player = activeSound.player
        if (activeSound.bufferSource.buffer === null) {
            throw new Error('Null audio buffer')
        }
        const audioDuration = activeSound.bufferSource.buffer.duration;
        const width = audioDuration / player.duration * 100;
        activeSound.width = width;
        activeSound.style.width = `${activeSound.width}%`;
        const audioEnd = player.audioEnd()
        if (audioEnd === null) {
            throw new Error('null audio end')
        }
        if (setDuration && audioEnd > player.duration)
            player.setDuration(audioEnd);
    } else {
        console.log("Cannot set width because audio buffer isn't ready");
    }
}


function noOverlap(activeSound: ActiveSound) {
    const position = activeSound.position;
    const end = activeSound.position + activeSound.width;
    for (const elem of activeSound.track.activeSounds) {
        if (elem !== activeSound) {
            const elemEnd = elem.position + elem.width;
            if ((elem.position >= position && elem.position < end) ||
                (elemEnd > position && elemEnd < end) ||
                (position >= elem.position && position < elemEnd)) {
                activeSound.move(activeSound.track, elemEnd, true)
                break;
            }
        }
    }
}


async function newBufferSource(activeSound: ActiveSound, audioCxt: AudioContext) {
    const source = audioCxt.createBufferSource();
    if (activeSound.buffer) {
        source.buffer = activeSound.buffer;
    } else {
        if (activeSound.audio === null || activeSound.audio === undefined) {
            throw new Error('No audio for BufferSource')
        }
        await fetchAudioBuffer(activeSound.audio.src, audioCxt, source);
        // On iOS Safari there seems to be no way of knowing when the
        // audio data is decoded, hence the following check.
        let waits = 50;
        while (waits && !source.buffer) {
            await new Promise(r => setTimeout(r, 100));
            waits--;
        }
        activeSound.buffer = source.buffer;
    }
    connectBufferSource(activeSound, source, audioCxt);
    return source;
}


function renewBufferSource(activeSound: ActiveSound, audioCxt: AudioContext): void {
    const source = audioCxt.createBufferSource()
    source.buffer = activeSound.buffer;
    activeSound.bufferSource = source;
    connectBufferSource(activeSound, source, audioCxt);
}


async function fetchAudioBuffer(src: string, audioCxt: AudioContext, bufferSource: AudioBufferSourceNode) {
    return fetch(src)
        .then(response =>  response.arrayBuffer())
        .then(data => audioCxt.decodeAudioData(
            data,
            buffer => bufferSource.buffer = buffer,
            error => console.error('Error decoding audio:', error)
        ))
}


function connectBufferSource(sound: Sound, bufferSource: AudioBufferSourceNode, audioCxt: AudioContext) {
    let panner;
    if (audioCxt.createStereoPanner) {
        panner = audioCxt.createStereoPanner();
        sound.stereoPanner = panner;
    }
    else {
        panner = audioCxt.createPanner();
        panner.panningModel = 'equalpower';
        sound.panner = panner;
    }
    bufferSource.connect(panner);
    panner.connect(audioCxt.destination);
}


function setPan(activeSound: ActiveSound) {
    const value = activeSound.track.panValue;
    if (activeSound.bufferSource) {
        if (activeSound.stereoPanner)
            activeSound.stereoPanner.pan.value = value;
        else if (activeSound.panner)
            activeSound.panner.setPosition(value, 0, 1 - Math.abs(value));
    }
}
