import { getSoundTracks } from './player.js';


class Cursor {
    constructor() {
        this.element = document.querySelector('#cursor');
        this.tracks = getSoundTracks();
        this.playing = false;
    }

    play() {
        const duration = this.tracks.duration - this.tracks.start;
        this.element.style.animationDuration = `${duration}s`;
        this.render();
        this.element.style.animationPlayState = 'running';
        this.playing = true;
    }

    pause() {
        this.element.style.animationPlayState = 'paused';
    }

    stop() {
        // Restart the animation
        // This seems to emit animationend event too
        if (this.playing) {
            this.element.style.animation = 'none';
            this.render();
            this.element.style.animation = null;
            this.element.style.animationPlayState = 'paused';
            this.playing = false;
        }
    }

    render() {
        this.element.offsetHeight;
    }
}

export { Cursor };