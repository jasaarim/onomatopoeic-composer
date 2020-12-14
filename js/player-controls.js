async function initialize() {
    const controls = document.querySelector('#player-controls');

    controls.player = document.querySelector('#player');
    controls.playButton = controls.querySelector('#play-button');
    controls.stopButton = controls.querySelector('#stop-button');

    controls.audioStart = audioStart;
    controls.play = play;
    controls.pause = pause;
    controls.stop = stop;
}


async function play() {
    if (!this.player.classList.contains('playing')) {
        this.player.classList.add('playing');
        const audioCxt = this.player.getAudioCxt();
        audioCxt.resume();
        this.player.applyActiveSounds(async sound => {
            let start = this.audioStart(sound);
            const offset = Math.max(0, -start);
            start = Math.max(0, start);
            sound.bufferSource.start(audioCxt.currentTime + start, offset);
        });
        this.player.cursor.play();
    } else {
        this.pause();
    }
}


function audioStart(sound) {
    let startSeconds = sound.position / 100 * this.player.duration;
    startSeconds = startSeconds - this.player.start;
    return startSeconds;
}


async function stop() {
    if (this.player.classList.contains('playing')) {
        await this.pause();
    }
    this.player.setStart(0);
    this.player.cursor.stop();
}


async function pause() {
    this.player.applyActiveSounds(async sound => {
        await sound.bufferSource.stop();
        sound.bufferSource = await sound.bufferSource.renew();
        sound.setPan();
    });
    this.player.classList.remove('playing')
    this.player.getAudioCxt().suspend();
    await this.player.cursor.pause();
}


initialize();
