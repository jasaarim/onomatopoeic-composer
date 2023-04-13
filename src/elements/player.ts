import { translate } from '../app.js';
import { newTrack, type Track } from './track.js';
import { type ActiveSound } from './sound-active.js';
import { type Cursor } from './player-cursor.js';


export interface Player extends HTMLElement {
    duration: number,
    start: number,
    cursor: Cursor,
    tracks: Element | null,
    length: number,
    setDuration: (seconds: number) => void,
    setStart: (seconds: number) => void,
    getAudioCxt: () => AudioContext,
    clearAudioCxt: () => void,
    applyActiveSounds: (action: (sound: ActiveSound) => void) => Promise<void>,
    warmedUp?: boolean,
    warmupAudioCxt: () => void,
    getATrack: () => Track,
    audioEnd: () => number,
    audioCxt?: AudioContext,
}

export interface Tracks extends HTMLElement {}


export async function initialize(num: number, duration: number) {

    const player = document.querySelector('#player') as Player;
    player.cursor = player.querySelector('#player-cursor') as Cursor;
    player.tracks = player.querySelector('#player-tracks') as Tracks;
    if (player.tracks === null) {
        throw new Error('Null tracks')
    }
    player.length = num;


    for (let i=1; i <= num; i++) {
        player.tracks.append(newTrack(i, num));
    }

    player.setDuration = (seconds) => setDuration(player, seconds);
    player.setStart = (seconds) => setStart(player, seconds);
    player.getAudioCxt = () => getAudioCxt(player);
    player.clearAudioCxt = () => clearAudioCxt(player);
    player.applyActiveSounds = (action) => applyActiveSounds(player, action);
    player.warmupAudioCxt = () => warmupAudioCxt(player);

    player.getATrack = () => getATrack(player);

    if (player.tracks.lastChild === null) {
        throw new Error('No tracks')
    }
    player.audioEnd = () => audioEnd(player.tracks as Tracks);

    player.setDuration(duration);
}


function audioEnd(tracks: Tracks): number {
    let end = 0;
    for (const track of tracks.querySelectorAll('.track')) {
        const trackEnd = (track as Track).audioEnd();
        if (trackEnd !== null && trackEnd > end) {
            end = trackEnd;
        }
    }
    return end;
}


function getATrack(player: Player): Track {
    let firstEnd, endsFirst;
    for (const track of player.querySelectorAll('div[id^="track"]') as any) {
        const end = (track as Track).audioEnd();
        if (!end)
            return track as Track;
        else
            if (!firstEnd || end < firstEnd) {
                firstEnd = end;
                endsFirst = track as Track;
            }
    }
    if (endsFirst === undefined) {
        throw new Error('No track available')
    }
    return endsFirst;
}


function setDuration(player: Player, seconds: number): void {
    if (seconds > 0) {
        const durationDisplay = document.querySelector('#player-duration');
        if (durationDisplay === null) {
            throw new Error('No durationDisplay')
        }
        const prevPosition = player.duration ? player.start / player.duration : 0;
        const ratio = player.duration / seconds;
        player.duration = seconds;
        player.setStart(prevPosition * player.duration);
        durationDisplay.textContent = `${Math.round(seconds * 10) / 10} s`;
        player.applyActiveSounds((sound: ActiveSound) => {
            sound.adjustWidth();
            sound.move(sound.parentElement as Track, ratio * sound.position);
        });
    } else {
        console.log(`Invalid duration: ${seconds}`);
    }
}


function setStart(player: Player, seconds: number): void {
    if (seconds >= 0 && seconds < player.duration) {
        player.start = seconds;
        updateCursor(player);
    } else {
        console.log(`Invalid start time: ${seconds}`);
    }
}


function updateCursor(player: Player): void {
    const startDisplay = document.querySelector('#player-start') as HTMLElement;
    player.cursor.start = player.start;
    const startPercentage  = player.start / player.duration * 100;
    player.cursor.style.left = `${startPercentage}%`;
    const rounded = Math.round(startPercentage * 10) / 10;
    startDisplay.textContent = `${translate('Start')}: ${rounded} %`;
}


function getAudioCxt(player: Player): AudioContext {
    if (player.audioCxt === undefined)
        player.audioCxt = newAudioCxt();
    return player.audioCxt;
}


function newAudioCxt(): AudioContext {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioCxt = new AudioContext();
    audioCxt.suspend();
    return audioCxt;
}


function clearAudioCxt(player: Player): void {
    if (player.audioCxt) {
        player.audioCxt.close();
        delete player.audioCxt;
    }
}


async function applyActiveSounds(player: Player, action: (sound: ActiveSound) => void): Promise<void> {
    for (const sound of player.querySelectorAll('.sound:not(.clone)') as any) {
        action(sound as ActiveSound);
    }
}


// Some mobile devices require this before the Audio Context works
function warmupAudioCxt(player: Player) {
    if (player.warmedUp === undefined || !player.warmedUp) {
        player.applyActiveSounds(sound => {
            if (player.warmedUp === undefined || !player.warmedUp) {
                if (sound.audio === null || sound.audio === undefined) {
                    throw new Error('No audio')
                }
                sound.audio.play().catch(() => {});
                sound.audio.pause();
                player.warmedUp = true;
            }
        });
    }
}
