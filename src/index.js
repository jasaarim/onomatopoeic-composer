import { initializeApp } from './app.js'
import initializePlayer from './elements/player.js?v=0.1.1';
import initializeMenu from './elements/sound-menu.js';
import './elements/player-controls.js?v=0.1.1';
import './elements/player-cursor.js?v=0.1.1';
import './elements/description.js';
import './events/events.js?v=0.1.1';


initializeApp('fi', 'Ääninen');
initializePlayer(8, 20);
initializeMenu('sounds.json');

