import { initializeApp } from './app.js';
import { initialize as initializePlayer } from './elements/player.js';
import initializeMenu from './elements/sound-menu.js';
import './elements/player-controls.js';
import './elements/player-cursor.js';
import './elements/description.js';
import './events/events.js';


initializeApp('fi', 'Ääninen');
initializePlayer(8, 20);
initializeMenu('sounds.json');

