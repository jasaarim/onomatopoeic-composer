function initializeTracks(num, duration) {
    const tracks =  getSoundTracks();

    makeTracks(tracks, num);

    // Let the #sound-tracks element contain this state
    tracks.getDuration = () => getDuration(tracks);
    tracks.setDuration = (seconds) => setDuration(tracks, seconds);
    tracks.getAudioCxt = () => getAudioCxt(tracks);
    tracks.clearAudioCxt = () => clearAudioCxt(tracks);
    tracks.applyActiveSounds = (action) => applyActiveSounds(action);

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


function getAudioCxt(tracks) {
    if (!tracks.audioCxt) {
        tracks.audioCxt = newAudioCxt();
    }
    return tracks.audioCxt;
}


function newAudioCxt() {
    const AudioContext = window.AudioContext
          || window.webkitAudioContext;
    const audioCxt = new AudioContext();

    return audioCxt;
}


function clearAudioCxt(tracks) {
    if (tracks.audioCxt) {
        tracks.audioCxt.close();
        delete tracks.audioCxt;
    }
}

function getDuration(tracks) {
    return tracks.duration;
}


function setDuration(tracks, seconds) {
    tracks.duration = seconds;
    applyActiveSounds(sound => sound.adjustWidth());
}


async function applyActiveSounds(action) {
    for (const sound of getActiveSounds()) {
        action(sound);
    }
}


function getActiveSounds() {
    return document.querySelectorAll('div[id^="active-sound"]');
}


class Cursor {
    constructor() {
        this.element = document.querySelector('#cursor');
        this.tracks = getSoundTracks();
    }

    play() {
        this.element.style.animationDuration = `${this.tracks.getDuration()}s`;
        this.element.style.animationPlayState = 'running';
    }

    pause() {
        this.element.style.animationPlayState = 'paused';
    }

    stop() {
        // Restart the animation
        this.element.style.animation = 'none';
        this.element.offsetHeight;
        this.element.style.animation = null;
        this.element.style.animationPlayState = 'paused';
    }
}


export { Cursor, getSoundTracks, initializeTracks };
