import { translate } from '../app.js';
import newSound from './sound.js';


export default async function initialize(indexFile) {
    const menu = document.querySelector('#sound-menu');
    populate(menu, indexFile);
}


async function populate(menu, indexFile) {
    menu.append(translate('Loading sounds...'));
    const frag = document.createDocumentFragment();
    try {
        await createAllSounds(indexFile).then(sounds => frag.append(...sounds));
        menu.append(frag);
    } catch {
        menu.append('Loading sound words failed!')
    } finally {
        menu.firstChild.remove();
    }
}


function createAllSounds(indexFile) {
    return fetchSoundNames(indexFile)
        .then(entries =>
              Object.keys(entries).map(
                  name => newSound(name, entries[name])))
        .catch(error => console.error('Error creating sounds:', error))
}


function fetchSoundNames(indexFile) {
    return fetch(indexFile)
        .then(response => response.json())
        .catch(error => console.error('Error:', error))
}
