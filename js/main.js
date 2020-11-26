import { initializeTracks } from './player.js';
import { populateSoundMenu } from './sounds.js';
import './events.js';

window.addEventListener('DOMContentLoaded', (event) => {
    initializeTracks(8, 10);
    populateSoundMenu();
});
