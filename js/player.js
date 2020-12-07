async function initializeTracks(num, duration) {
    const tracks = getSoundTracks();

    makeTracks(tracks, num);

    // Let the #sound-tracks element contain these methods and the state that
    // the methods modify.
    //
    // Changing duration also changes the start so that the cursor
    // stays in place
    tracks.setDuration = setDuration;
    tracks.setStart = setStart;
    tracks.getAudioCxt = getAudioCxt;
    tracks.clearAudioCxt = clearAudioCxt;
    tracks.applyActiveSounds = applyActiveSounds;

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


function makeTracks(tracks, num) {
    for (let i=1; i <= num; i++) {
        const track = document.createElement('div');
        track.className = 'track';
        track.id = `track${i}`;
        // The whitespace before the track number is a unicode en space
        track.appendChild(document.createTextNode(` ${i}`));
        tracks.appendChild(track);
    }
}


function setDuration(seconds) {
    if (seconds > 0) {
        const inputDuration = document.querySelector('#input-duration');
        const prevPosition = this.duration ? this.start / this.duration : 0;
        this.duration = seconds;
        this.setStart(prevPosition * this.duration);
        inputDuration.value = seconds;
        this.applyActiveSounds(sound => sound.adjustWidth());
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
    const inputStart = document.querySelector('#input-start');
    cursor.start = tracks.start;
    const startPercentage  = tracks.start / tracks.duration * 100;
    cursor.style.left = `${startPercentage}%`;
    inputStart.value = startPercentage;
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
    for (const sound of getActiveSounds()) {
        action(sound);
    }
}


function getActiveSounds() {
    return document.querySelectorAll('div[id^="active-sound"]');
}


export { getSoundTracks, initializeTracks };
