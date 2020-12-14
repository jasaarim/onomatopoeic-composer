async function initializeTracks(num, duration) {
    const tracks = makeTracks(num);

    tracks.setDuration = setDuration;
    tracks.setStart = setStart;
    tracks.getAudioCxt = getAudioCxt;
    tracks.clearAudioCxt = clearAudioCxt;
    tracks.applyActiveSounds = applyActiveSounds;

    tracks.getATrack = getATrack;
    tracks.audioEnd = audioEnd;

    tracks.length = num;
    tracks.setDuration(duration);

    return tracks;
}


function getSoundTracks(track) {
    // In tests we may need to access #sound-tracks through a track
    let tracks;
    if (track) {
        tracks = track.parentElement;
    } else {
        tracks = document.querySelector('#sound-tracks');
    }
    return tracks;
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


function makeTracks(num) {
    const tracks = getSoundTracks();
    for (let i=1; i <= num; i++) {
        const track = document.createElement('div');
        track.className = 'track';
        track.id = `track${i}`;
        // The whitespace before the track number is a unicode en space
        track.append(` ${i}`);
        tracks.append(track);
        track.audioEnd = audioEnd;
        // For stereo panning
        track.panValue = -1 + 2 / (num - 1) * (i - 1);
    }
    return tracks
}


function audioEnd() {
    const duration = this.duration || this.parentElement.duration;
    const sounds = this.querySelectorAll('div[id^="active-sound"]');
    if (sounds.length === 0)
        return null;
    else
        return lastEnd(sounds, duration);
}


function lastEnd(sounds, duration) {
    return Array.from(sounds)
        .map(sound => (sound.position + sound.width) / 100 * duration || 0)
        .reduce((a, b) => Math.max(a, b), 0);
}


function setDuration(seconds) {
    if (seconds > 0) {
        const durationDisplay = document.querySelector('#tracks-duration');
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
    const cursor = tracks.querySelector('#cursor');
    const startDisplay = document.querySelector('#tracks-start');
    cursor.start = tracks.start;
    const startPercentage  = tracks.start / tracks.duration * 100;
    cursor.style.left = `${startPercentage}%`;
    startDisplay.textContent = `Start: ${Math.round(startPercentage * 10) / 10} %`;
}


function getAudioCxt() {
    if (!this.audioCxt) {
        this.audioCxt = newAudioCxt();
    }
    return this.audioCxt;
}


function newAudioCxt() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCxt = new AudioContext();

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


export { getSoundTracks, initializeTracks };
