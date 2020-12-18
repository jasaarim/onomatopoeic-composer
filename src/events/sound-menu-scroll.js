export default function scroll(event) {
    const data = {
        menu: event.target.parentElement,
        initialY: event.pageY,
        initialScrollTop: event.target.parentElement.scrollTop,
        previousTime: Date.now(),
        previousY: event.pageY,
        velocity: null,
        downwards: null
    };

    data.updateVelocity = updateVelocity;

    event.target.setPointerCapture(event.pointerId);

    // Bind for the event listeners
    data.pointerMove = pointerMove.bind(data);
    data.pointerUp = pointerUp.bind(data);

    document.addEventListener('pointermove', data.pointerMove,
                              {'passive': true});
    document.addEventListener('pointerup', data.pointerUp);
    document.addEventListener('pointercancel', data.pointerUp);
}


function updateVelocity(event) {
    const time = Date.now();
    const velocity = ((event.pageY - this.previousY)
                      / (time - this.previousTime));
    if (this.velocity)
        this.velocity = (velocity + this.velocity) / 2
    else
        this.velocity = velocity
    this.previousY = event.pageY;
    this.previousTime = time;
    this.downwards = this.initialY > event.pageY;
}


function pointerMove(event) {
    this.menu.scrollTop = this.initialScrollTop + this.initialY - event.pageY;
    this.updateVelocity(event);
}


function pointerUp(event) {
    document.removeEventListener('pointermove', this.pointerMove);
    document.removeEventListener('pointerup', this.pointerUp);
    document.removeEventListener('pointercancel', this.pointerUp);

    endInertia(this.menu, this.downwards, this.velocity, null, null);

    event.target.releasePointerCapture(event.pointerId);
}


function endInertia(menu, downwards, v, t0, t) {
    if (t && t0) {
        const dt = t - t0;
        if (dt < 0 || (downwards && (v > 0)) || (!downwards && (v < 0))) {
            menu.onclick = false;
            return;
        }
        menu.scrollTop -= dt * v;
        v = (1 - 0.002 * dt) * v;
    } else {
        // The inertial scroll can be stopped by clicking on the menu
        menu.onclick = () => { menu.onclick = null; };
    }
    if (Math.abs(v) > 0.2
        && menu.scrollTop > 0
        && menu.scrollTop < (menu.scrollHeight - menu.offsetHeight)
        && menu.onclick) {

        window.requestAnimationFrame(
            endInertia.bind(null, menu, downwards, v, t)
        );
    }
    else {
        menu.onclick = false;
    }
}
