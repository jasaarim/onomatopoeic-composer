function initializeTracks(num, duration) {
    const tracks =  getSoundTracks();

    makeTracks(tracks, num);

    // Let the #sound-tracks element contain this state
    // Changing duration changes the start
    tracks.setDuration = (seconds) => setDuration(tracks, seconds);
    tracks.setStart = (seconds) => setStart(tracks, seconds);
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


function setDuration(tracks, seconds) {
    if (seconds > 0) {
        const prevPosition = tracks.duration ? tracks.start / tracks.duration : 0;
        tracks.duration = seconds;
        const newStart = prevPosition * tracks.duration;
        tracks.setStart(newStart);
        applyActiveSounds(sound => sound.adjustWidth(tracks));
    } else {
        console.log('Invalid duration');
    }
}


function setStart(tracks, seconds) {
    const duration = tracks.duration;
    if (seconds >= 0 && seconds < duration) {
        tracks.start = seconds;
        updateCursor(tracks);
    } else {
        console.log(`Invalid start time: ${seconds}`);
    }
}


function updateCursor(tracks) {
    const cursor = tracks.querySelector('#cursor');
    cursor.start = tracks.start;
    cursor.style.left = `${tracks.start / tracks.duration * 100}%`;
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


async function applyActiveSounds(action) {
    for (const sound of getActiveSounds()) {
        action(sound);
    }
}


function getActiveSounds() {
    return document.querySelectorAll('div[id^="active-sound"]');
}




export { getSoundTracks, initializeTracks };
