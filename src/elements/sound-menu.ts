import { translate } from '../app.js';
import { newSound, type Sound, type Files } from './sound.js';



export default async function initialize(indexFile: string) {
    const menu = document.querySelector('#sound-menu') as HTMLElement;
    if (menu === null) {
        throw new Error('Null menu');
    }
    populate(menu, indexFile);
}


async function populate(menu: HTMLElement, indexFile: string) {
    menu.append(translate('Loading sounds...'));
    const frag = document.createDocumentFragment();
    try {
        await createAllSounds(indexFile).then((sounds) => frag.append(...sounds));
        menu.append(frag);
    } catch {
        menu.append('Loading sound words failed!')
    } finally {
        if (menu.firstChild === null) {
            throw new Error('No menu children')
        }
        menu.firstChild.remove();
    }
}


async function createAllSounds(indexFile: string): Promise<Sound[]> {
    return fetchSoundNames(indexFile)
        .then(entries =>
              Object.keys(entries).map(
                  name => newSound(name, entries[name])))
        .catch(() => {
            throw new Error('Could not create sounds')
        })
}


async function fetchSoundNames(indexFile: string): Promise<Record<string, Files>> {
    return fetch(indexFile)
        .then(response => response.json())
        .catch(error => console.error('Error:', error))
}
