import { getSoundTracks } from './player.js';


function play() {
    const tracks = getSoundTracks();
    const audioCxt = tracks.getAudioCxt();
    if (!audioCxt.playing) {
        tracks.applyActiveSounds(async sound => {
            let start = audioStart(sound);
            const offset = Math.max(0, -start);
            start = Math.max(0, start);
            sound.bufferSource.start(audioCxt.currentTime + start, offset);
        });
        audioCxt.playing = true;
    }
    return audioCxt.resume();
}


function audioStart(sound) {
    const tracks = sound.parentElement.parentElement;
    let startSeconds = sound.position / 100 * tracks.duration;
    startSeconds = startSeconds - tracks.start;
    return startSeconds;
}


function stop() {
    const tracks = getSoundTracks();
    const audioCxt = tracks.getAudioCxt();
    if (audioCxt.playing) {
        tracks.applyActiveSounds(async sound => {
            await sound.bufferSource.stop();
            sound.bufferSource = await sound.bufferSource.renew();
        });
        audioCxt.playing = false;
    } else {
        // This may happen on pressing the stop button button if that emits an
        // animationend event.
        console.log('Stopping when not playing');
    }

    return audioCxt.resume();
}


function pause() {
    const audioCxt = getSoundTracks().getAudioCxt();
    if (audioCxt.playing) {
        return audioCxt.suspend();
    } else {
        return audioCxt.resume();
    }
}


export { pause, stop, play };
