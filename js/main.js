import { initializeTracks } from './player.js';
import { populateSoundMenu } from './sound-creation.js';
import './events.js';


window.addEventListener('DOMContentLoaded', (event) => {
    initializeTracks(8, 10);
    populateSoundMenu(8);
});
