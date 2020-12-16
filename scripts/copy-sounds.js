#! /usr/bin/env node

/** Script to copy old Finnish Ääninen files to correct locations
 *
 * This should be relevant only to those in possession of the old
 * files, and will be removed from the repository in the future.
 *
 * This expects that the files are located in `data/originals/audio`
 * and in `data/originals/descriptions`.
 *
 * After running this script, the script `decode-sound-files.sh`
 * should be run.
 *
 */

const fs = require('fs');


function copyCallback(err) {
    if (err) throw err;
}


function main() {
    const audioFiles = fs.readdirSync('data/originals/audio');
    const descriptions = fs.readdirSync('data/originals/descriptions');
    for (const descr of descriptions) {
        const base = descr.split('.txt')[0];
        // Take only the descriptions that do not have a number
        if (['1', '2', '3'].includes(base[base.length - 1])) {
            continue;
        }
        fs.copyFile(
            `data/originals/descriptions/${descr}`,
            `data/descriptions/${descr}`,
            copyCallback
        );
        // Take the first existing audio from the suffix list below
        for (const suffix of ['', 1, 2, 3]) {
            const candidate = `${base}${suffix}.mp3`;
            const targetName = `${base}.mp3`;
            if (audioFiles.includes(candidate)) {
                fs.copyFile(
                    `data/originals/audio/${candidate}`,
                    `data/audio/${targetName}`,
                    copyCallback
                );
                break;
            }
        }
    }
}


main();
