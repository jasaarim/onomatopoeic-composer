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
        let left = window.getComputedStyle(this.element).left;
        left = Number(left.split('px')[0]);
        const position = left / this.element.parentElement.clientWidth;
        // Annoyingly, we have to set the position after the animationend event
        // is processed, hence the cloning and hiding
        const clone = this.element.cloneNode();
        this.element.parentElement.append(clone);
        clone.style.left = left;
        this.element.style.visibility = 'hidden';
        this.stop();
        setTimeout(() => {
            this.tracks.setStart(position * this.tracks.duration)
            this.element.style.visibility = null;
            clone.remove();
        }, 50);
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
