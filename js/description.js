async function showDescription(sound) {
    if (sound.files.description) {
        const description = document.querySelector('#description');
        if (!description.prepareContent) {
            description.prepareContent = prepareContent;
            description.play = play;
            description.pause = pause;
            description.clear = clear;
        }
        if (description.soundName != sound.name) {
            fetch(sound.files.description)
                .then(response => response.text())
                .then(text => description.prepareContent(sound, text));
        }
    }
}


function prepareContent(sound, text) {
    this.clear();
    this.soundName = sound.name;
    const h = document.createElement('h3');
    h.append(sound.name.charAt(0).toUpperCase()
             + sound.name.slice(1));
    const p = document.createElement('p');
    p.append(text)
    this.text = [h, p]
    this.append(...this.text);
    if (sound.audio) {
        this.audio = sound.audio;
        this.audio.preload = 'auto';
        this.classList.add('audio');
    }
}


function play() {
    this.audio.play();
    this.classList.add('playing');
    this.audio.onended = () => {
        this.classList.remove('playing');
    }
}

function pause() {
    this.audio.pause();
    this.classList.remove('playing');
}


function clear() {
    description.soundName = null;
    if (this.text)
        for (const p of this.text)
            p.remove();
    if (this.classList.contains('playing')) {
        this.pause();
        this.audio.currentTime = 0;
    }
    if (this.audio) {
        this.audio.onended = null;
        this.audio = null;
        this.classList.remove('audio');
    }
}


export { showDescription };
