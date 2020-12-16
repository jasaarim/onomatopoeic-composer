import soundDrag from './sound-drag.js';
import soundMenuScroll from './sound-menu-scroll.js';


function dragScrollOrFocus(event) {
    let focusing;
    function focus() {
        focusing = true;
        document.removeEventListener('pointerup', focus);
        event.target.focus();
    }
    document.addEventListener('pointerup', focus);
    window.setTimeout(() => {
        if (!focusing) {
            dragOrScroll(event);
            document.removeEventListener('pointerup', focus);
        }
    }, 100)
    event.preventDefault();
}


function dragOrScroll(event) {
    let scrolling;
    const initialY = event.pageY;
    const soundHeight =  event.target.clientHeight;
    function startScroll(event) {
        if (Math.abs(event.pageY - initialY) > (0.2 * soundHeight)) {
            scrolling = true;
            document.removeEventListener('pointermove', startScroll);
            soundMenuScroll(event);
        }
    }
    document.addEventListener('pointermove', startScroll);
    window.setTimeout(() => {
        if (!scrolling) {
            document.removeEventListener('pointermove', startScroll);
            soundDrag(event);
        }
    }, 200)
}


export { dragScrollOrFocus };
