async function initialize() {
    const cursor = document.querySelector('#player-cursor');

    cursor.player = document.querySelector('#player');
    cursor.tracks = cursor.parentElement;

    cursor.play = play;
    cursor.pause = pause;
    cursor.stop = stop;
    cursor.render = render;
}


async function play() {
    const duration = this.player.duration - this.player.start;
    this.style.animationDuration = `${duration}s`;
    this.render();
    this.style.animationPlayState = 'running';
    // This attribute is needed because otherwise stop would emit animationend
    // and then call stop again indefinately
    this.playing = true;
}


async function pause() {
    let left = window.getComputedStyle(this).left;
    left = Number(left.split('px')[0]);
    const position = left / this.player.clientWidth;
    // Annoyingly, we have to set the position after the animationend event
    // is processed, hence the cloning and hiding
    const clone = this.cloneNode();
    this.tracks.append(clone);
    clone.style.left = left;
    this.style.visibility = 'hidden';
    this.stop();
    // Wait a while and then remove the clone
    await new Promise(_ => setTimeout(_, 50));
    this.player.setStart(position * this.player.duration)
    this.style.visibility = null;
    clone.remove();
}

async function stop() {
    // Restart the animation
    // This seems to emit animationend event too; use attribute playing to
    // prevent further calls to stop.
    if (this.playing) {
        this.style.animation = 'none';
        this.render();
        this.style.animation = null;
        this.style.animationPlayState = 'paused';
        this.playing = false;
    }
}


function render() {
    this.offsetHeight;
}


initialize();
