import { initializeApp } from './app.js'
import { initializePlayer } from './elements/player.js'
import { initializeSoundMenu } from './elements/sound-menu.js'
import './elements/player-controls.js'
import './elements/player-cursor.js'
import './elements/description.js'
import './events/events.js'

initializeApp('fi', 'Ääninen')
initializePlayer(8, 20)
initializeSoundMenu('sounds.json')
