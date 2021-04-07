async function initialize() {
    const cursor = document.querySelector('#player-cursor');

    cursor.player = document.querySelector('#player');
    cursor.tracks = cursor.parentElement;

    cursor.play = play;
    cursor.pause = pause;
    cursor.stop = stop;
}


async function play() {
    const duration = this.player.duration - this.player.start;
    const position = this.player.start / this.player.duration;
    const left = position * this.player.clientWidth;
    this.style.left = `{left}px`;
    this.style.transitionDuration = `${duration}s`;
    this.style.left = '100%';
}


async function pause() {
    let left = window.getComputedStyle(this).left;
    left = Number(left.split('px')[0]);
    const position = left / this.player.clientWidth;
    this.style.transitionDuration = null;
    this.player.setStart(position * this.player.duration)
}


async function stop() {
    this.style.transitionDuration = null;
}


initialize();
