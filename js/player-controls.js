import { getSoundTracks } from './player.js';


function play() {
    const tracks = getSoundTracks();
    const audioCxt = tracks.getAudioCxt();
    if (!audioCxt.playing) {
        tracks.applyActiveSounds(async sound => {
            let start = audioStart(sound);
            const offset = Math.max(0, -start);
            start = Math.max(0, start);
            sound.audioBuffer.start(audioCxt.currentTime + start, offset);
        });
        audioCxt.playing = true;
    }
    return audioCxt.resume();
}


function audioStart(sound) {
    return sound.position / 100 * getSoundTracks().getDuration();
}


function stop() {
    const tracks = getSoundTracks();
    const audioCxt = tracks.getAudioCxt();
    tracks.applyActiveSounds(async sound => {
        sound.audioBuffer.stop();
        sound.audioBuffer = sound.audioBuffer.renew();
    });
    audioCxt.playing = false;

    return audioCxt.resume();
}


function pause() {
    const audioCxt = getSoundTracks().getAudioCxt();
    return audioCxt.suspend();
}


export { pause, stop, play };
