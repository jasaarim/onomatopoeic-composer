import { newTrack } from './track.js'


async function initialize(num, duration) {

    const player = document.querySelector('#player');
    player.cursor = player.querySelector('#player-cursor');
    player.tracks = player.querySelector('#player-tracks');
    player.length = num;

    for (let i=1; i <= num; i++) {
        player.tracks.append(newTrack(i, num));
    }

    player.setDuration = setDuration;
    player.setStart = setStart;
    player.getAudioCxt = getAudioCxt;
    player.clearAudioCxt = clearAudioCxt;
    player.applyActiveSounds = applyActiveSounds;

    player.getATrack = getATrack;
    // This method will work in both a track and in the player
    player.audioEnd = player.tracks.lastChild.audioEnd;

    player.setDuration(duration);
}



function getATrack() {
    let firstEnd, endsFirst;
    for (const track of this.querySelectorAll('div[id^="track"]')) {
        const end = track.audioEnd();
        if (!end)
            return track;
        else
            if (!firstEnd || end < firstEnd) {
                firstEnd = end;
                endsFirst = track;
            }
    }
    return endsFirst;
}


function setDuration(seconds) {
    if (seconds > 0) {
        const durationDisplay = document.querySelector('#player-duration');
        const prevPosition = this.duration ? this.start / this.duration : 0;
        const ratio = this.duration / seconds;
        this.duration = seconds;
        this.setStart(prevPosition * this.duration);
        durationDisplay.textContent = `${Math.round(seconds * 10) / 10} s`;
        this.applyActiveSounds(sound => {
            sound.adjustWidth();
            sound.move(sound.parentElement, ratio * sound.position);
        });
    } else {
        console.log(`Invalid duration: ${seconds}`);
    }
}


function setStart(seconds) {
    if (seconds >= 0 && seconds < this.duration) {
        this.start = seconds;
        updateCursor(this);
    } else {
        console.log(`Invalid start time: ${seconds}`);
    }
}


function updateCursor(tracks) {
    const cursor = player.querySelector('#player-cursor');
    const startDisplay = document.querySelector('#player-start');
    cursor.start = player.start;
    const startPercentage  = player.start / player.duration * 100;
    cursor.style.left = `${startPercentage}%`;
    startDisplay.textContent = `Start: ${Math.round(startPercentage * 10) / 10} %`;
}


function getAudioCxt() {
    if (!this.audioCxt)
        this.audioCxt = newAudioCxt();
    return this.audioCxt;
}


function newAudioCxt() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCxt = new AudioContext();
    audioCxt.suspend();
    return audioCxt;
}


function clearAudioCxt() {
    if (this.audioCxt) {
        this.audioCxt.close();
        delete this.audioCxt;
    }
}


async function applyActiveSounds(action) {
    for (const sound of this.querySelectorAll('.sound:not(.clone)')) {
        action(sound);
    }
}


export default initialize;
