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


function main() {
    const audioFiles = fs.readdirSync('data/originals/audio');
    const descriptions = fs.readdirSync('data/originals/descriptions');
    for (const descr of descriptions) {
        const base = descr.split('.txt')[0];
        // Take only the descriptions that do not have a number
        if (['1', '2', '3'].includes(base[base.length - 1])) {
            continue;
        }
        fs.copyFileSync(
            `data/originals/descriptions/${descr}`,
            `data/descriptions/${descr}`,
        );
        // Take the first existing audio from the suffix list below
        for (const suffix of ['', 1, 2, 3]) {
            const candidate = `${base}${suffix}.mp3`;
            const targetName = `${base}.mp3`;
            if (audioFiles.includes(candidate)) {
                fs.copyFileSync(
                    `data/originals/audio/${candidate}`,
                    `data/audio/${targetName}`,
                );
                if (suffix != '') {
                    descrCandidate = `${base}${suffix}.txt`;
                    if (descriptions.includes(descrCandidate)) {
                        let sample = fs.readFileSync(
                            `data/originals/descriptions/${descrCandidate}`);
                        sample = String(sample).split('txtSelitys=')[1];
                        sample = sample.replace('Max', 'mies');
                        sample = (sample.charAt(0).toLowerCase()
                                  + sample.slice(1));
                        fs.appendFileSync(
                            `data/descriptions/${descr}`,
                            `\r\nNäyte: ${sample}`
                        );
                    }
                }
                break;
            }
        }
    }
}


main();
