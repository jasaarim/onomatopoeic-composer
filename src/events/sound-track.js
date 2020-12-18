default export function soundToTrack(sound, track, position) {
    const player = document.querySelector('#player');
    if (!track) {
        track = player.getATrack();
        position = position || track.audioEnd / player.duration * 100;
    }
    if (!position)
        position = player.start / player.duration * 100;
    if (sound.move)
        sound.move(track, position, true);
    else
        newActiveSound(sound, track, position);
}
