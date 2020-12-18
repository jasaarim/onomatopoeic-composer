import soundDrag from './sound-drag.js';
import soundMenuScroll from './sound-menu-scroll.js';


export default function dragScrollOrFocus(event) {
    event.preventDefault();

    const data = {
        noDrag: false,
        initialY: event.pageY,
        sound: event.target.closest('.sound')
    };

    data.removeListeners = removeListeners;

    // Bind for the event listeners
    data.pointerMove = maybeScroll.bind(data);
    data.pointerUp = maybeFocus.bind(data);

    document.addEventListener('pointermove', data.pointerMove,
                              {'passive': true});
    document.addEventListener('pointerup', data.pointerUp);
    document.addEventListener('pointercancel', data.pointerUp);

    const mouseEvent = event.pointerType == 'mouse';
    const timeOut = (mouseEvent && (event.target == data.sound))  ? 100 : 200;

    window.setTimeout(() => {
        if (!data.noDrag) {
            data.removeListeners();
            soundDrag(event);
            if (mouseEvent)
                data.sound.focus();
        }
    }, timeOut)
}


function maybeFocus(event) {
    this.noDrag = true;
    this.removeListeners();
    if (!dragThreshold(event, this.initialY, this.sound))
        event.target.focus();
}


function maybeScroll(event) {
    if (dragThreshold(event, this.initialY, this.sound)) {
        this.noDrag = true;
        this.removeListeners();
        soundMenuScroll(event);
    }
}


function dragThreshold(event, initialY, sound) {
    const soundHeight =  sound.clientHeight;
    return Math.abs(event.pageY - initialY) > (0.5 * soundHeight)
}


function removeListeners() {
    document.removeEventListener('pointerup', this.pointerUp);
    document.removeEventListener('pointercancel', this.pointerUp);
    document.removeEventListener('pointermove', this.pointerMove);
}
