import { type Player, type Tracks } from './player.js'

export interface Cursor extends HTMLElement {
    start: Number,
    player: Player,
    tracks: Tracks,
    play: () => void,
    pause: () => void,
    stop: () => void,
}

async function initialize() {
    const cursor = document.querySelector('#player-cursor') as Cursor;

    cursor.player = document.querySelector('#player') as Player;
    cursor.tracks = cursor.parentElement as Tracks;

    cursor.play = () => play(cursor);
    cursor.pause = () => pause(cursor);
    cursor.stop = () => stop(cursor);
}


async function play(cursor: Cursor) {
    const duration = cursor.player.duration - cursor.player.start;
    const position = cursor.player.start / cursor.player.duration;
    const left = position * cursor.player.clientWidth;
    cursor.style.left = `${left}px`;
    cursor.style.transitionDuration = `${duration}s`;
    cursor.style.left = '100%';
}


async function pause(cursor: Cursor) {
    const left = window.getComputedStyle(cursor).left;
    const leftNum = Number(left.split('px')[0]);
    const position = leftNum / cursor.player.clientWidth;
    cursor.style.transitionDuration = 'unset';
    cursor.player.setStart(position * cursor.player.duration)
}


async function stop(cursor: Cursor) {
    cursor.style.transitionDuration = 'unset';
}


initialize();
