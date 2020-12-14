async function keyboardInteraction(event) {
    if (document.activeElement.classList.contains('sound')) {
        const sound = document.activeElement;
        if (event.keyCode == 32) {
            // Space
            const description = document.querySelector('#description');
            if (description.soundName == sound.name && description.audio) {
                description.play();
                event.preventDefault();
            }
        } else if (event.keyCode == 13) {
            // Enter
            sound.addButton.click();
        } else if ([37, 38, 39, 40].includes(event.keyCode)) {
            // Arrow keys
            if (sound.classList.contains('active')) {
                moveSound(sound, event);
            } else if ([37, 39].includes(event.keyCode)) {
                moveCursor(event);
            } else {
                changeSoundMenuFocus(sound, event);
            }
        }
    } else if ([37, 39].includes(event.keyCode)) {
        // Left and right arrow keys
        moveCursor(event);
    } else if ([38, 40].includes(event.keyCode)) {
        // Up and down arrow keys
        document.querySelector('#sound-menu').querySelector('.sound').focus();
        event.preventDefault();
    }
}



function changeSoundMenuFocus(sound, event) {
    if (event.keyCode == 38 &&
        sound.previousSibling &&
        sound.previousSibling.classList &&
        sound.previousSibling.classList.contains('sound'))

        sound.previousSibling.focus();
    else if (event.keyCode == 40 &&
             sound.nextSibling &&
             sound.nextSibling.classList &&
             sound.nextSibling.classList.contains('sound'))
        sound.nextSibling.focus();
    event.preventDefault();
}


function moveSound(sound, event) {
    let position = sound.position;
    let track = sound.parentElement;
    if (event.keyCode == 39)
        position = Math.round(sound.position + 1);
    else if (event.keyCode == 37)
        position = Math.round(sound.position - 1);
    else if (event.keyCode == 38 &&
             track.previousSibling &&
             track.previousSibling.classList &&
             track.previousSibling.classList.contains('track'))
        track = track.previousSibling;
    else if (event.keyCode == 40 &&
             track.nextSibling &&
             track.nextSibling.classList &&
             track.nextSibling.classList.contains('track'))
        track = track.nextSibling;
    sound.move(track, position, true);
    sound.focus();
}


function moveCursor(event) {
    const player = document.querySelector('#player');
    let start = null;
    if (event.keyCode === 39)
        start = Math.min(player.start + 0.01 * player.duration,
                         0.99 * player.duration);
    else if (event.keyCode === 37)
        start = Math.max(player.start - 0.01 * player.duration, 0);
    if ('null' != start)
        player.setStart(start)
}


export default keyboardInteraction;
