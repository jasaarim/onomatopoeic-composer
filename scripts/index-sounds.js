#! /usr/bin/env node

const fs = require('fs');


function copyCallback(err) {
    if (err) throw err;
}

function main() {
    let sounds = {};
    const audioFiles = fs.readdirSync('original_audio');
    const descriptions = fs.readdirSync('original_descriptions');
    for (const descr of descriptions) {
        const base = descr.split('.txt')[0];
        // Take only decriptions that do not have a number
        if (['1', '2', '3'].includes(base[base.length - 1])) {
            continue;
        }
        fs.copyFile(
            `original_descriptions/${descr}`,
            `descriptions/${descr}`,
            copyCallback
        );
        let audio;
        for (const suffix of ['', 1, 2, 3]) {
            const candidate = `${base}${suffix}.mp3`;
            if (audioFiles.includes(candidate)) {
                audio = candidate;
                fs.copyFile(
                    `original_audio/${audio}`,
                    `audio/${audio}`,
                    copyCallback
                );
                break;
            }
        }
        if (audio) {
            sounds[base] = {audio: `/audio/${audio}`,
                            description: `/descriptions/${descr}`};
        } else {
            sounds[base] = {description: `/descriptions/${descr}`};
        }
    }
    fs.writeFileSync('sounds.json', JSON.stringify(sounds));
}


main();
