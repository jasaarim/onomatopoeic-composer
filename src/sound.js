function newSound(name, files) {
    const sound = document.createElement('div');
    const audio = files.audio ? createSoundAudio(name, files.audio) : null;
    const addButton = createAddButton(audio);

    sound.className = 'sound';
    sound.id = 'sound-' + name;
    sound.tabIndex = '0';
    sound.name = name;
    sound.audio = audio;
    sound.addButton = addButton;
    sound.files = files;

    audio ? sound.append(audio) : sound.classList.add('no-audio');
    sound.append(addButton);
    sound.append(name);

    return sound
}


function createSoundAudio(name, source) {
    const audio = document.createElement('audio');

    audio.controls = false;
    audio.src = source;
    audio.preload = 'none';

    return audio;
}


function createAddButton(audio) {
    const button = document.createElement('button');
    button.className = 'add-button';
    button.append(addButtonSvg());
    if (!audio)
        button.disabled = true;
    return button;
}


function addButtonSvg() {
    const svgUri = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgUri, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    const polygonH = document.createElementNS(svgUri, 'polygon');
    polygonH.setAttribute('points', '0,60 100,60 100,40 0,40');
    const polygonV = document.createElementNS(svgUri, 'polygon');
    polygonV.setAttribute('points', '60,0 60,100 40,100 40,0');
    polygonV.setAttribute('class', 'plus-button');
    svg.append(polygonH, polygonV);
    return svg;
}


export { newSound };
