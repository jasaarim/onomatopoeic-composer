function scroll(event) {
    const data = {
        menu: event.target.parentElement,
        initialY: event.pageY,
        initialScrollTop: event.target.parentElement.scrollTop
    };

    // Bind for the event listeners
    data.pointerMove = pointerMove.bind(data);
    data.pointerUp = pointerUp.bind(data);

    document.addEventListener('pointermove', data.pointerMove);
    document.addEventListener('pointerup', data.pointerUp);
    document.addEventListener('pointercancel', data.pointerUp);
}


function pointerMove(event) {
    this.menu.scrollTop = this.initialScrollTop + this.initialY - event.pageY;
}

function pointerUp(event) {
    document.removeEventListener('pointermove', this.pointerMove);
    document.removeEventListener('pointerup', this.pointerUp);
    document.removeEventListener('pointercancel', this.pointerUp);
}


export default scroll;
