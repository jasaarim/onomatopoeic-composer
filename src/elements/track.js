export default function newTrack(num, numAll) {
    const track = document.createElement('div');
    track.player = document.querySelector('#player');

    track.className = 'track';
    track.id = `track${num}`;

    track.audioEnd = audioEnd;

    // For stereo panning
    track.panValue = -1 + 2 / (numAll - 1) * (num - 1);

    // The whitespace before the track number is a unicode en space
    track.append(` ${num}`);

    return track;
}


function audioEnd() {
    const duration = this.duration || this.player.duration;
    const sounds = this.querySelectorAll('.sound:not(.clone)');
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
