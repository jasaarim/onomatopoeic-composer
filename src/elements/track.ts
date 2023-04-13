import { type Player } from './player.js'
import { type ActiveSound } from './sound-active.js'

export interface Track extends HTMLDivElement {
    player: Player | null,
    audioEnd: () => number | null,
    panValue: number,
    activeSounds: ActiveSound[],
    duration: number,
}


export function newTrack(num: number, numAll: number) {
    const track = document.createElement('div') as Track;
    track.player = document.querySelector('#player');

    track.className = 'track';
    track.id = `track${num}`;

    track.activeSounds = []

    track.audioEnd = () => audioEnd(track);

    // For stereo panning
    track.panValue = -1 + 2 / (numAll - 1) * (num - 1);

    // The whitespace before the track number is a unicode en space
    track.append(` ${num}`);

    return track;
}


function audioEnd(track: Track): number | null {
    const duration = track.duration || track.player?.duration;
    if (duration === null || duration === undefined) {
        throw new Error('null duration in track')
    }
    const sounds = track.activeSounds;
    if (sounds.length === 0)
        return null;
    else
        return lastEnd(sounds, duration);
}


function lastEnd(sounds: ActiveSound[], duration: number) {
    return Array.from(sounds)
        .map(sound => (sound.position + sound.width) / 100 * duration || 0)
        .reduce((a, b) => Math.max(a, b), 0);
}
