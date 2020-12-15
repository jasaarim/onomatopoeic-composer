import initializePlayer from './player.js';
import initializeMenu from './sound-menu.js';
import './player-controls.js';
import './player-cursor.js';
import './description.js';
import './events.js';


window.addEventListener('DOMContentLoaded', (event) => {
    initializePlayer(8, 20);
    initializeMenu('/sounds.json');
});
