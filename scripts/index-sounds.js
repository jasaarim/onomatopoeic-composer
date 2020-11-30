const fs = require('fs');


function main() {
    let sounds = {};
    const audioFiles = fs.readdirSync('sounds');
    const descriptions = fs.readdirSync('descriptions');
    for (const descr of descriptions) {
        const base = descr.split('.txt')[0];
        if (['1', '2', '3'].includes(base[base.length - 1])) {
            continue;
        }
        let audio;
        for (const suffix of ['', 1, 2, 3]) {
            const candidate = `${base}${suffix}.mp3`;
            if (audioFiles.includes(candidate)) {
                audio = candidate;
                break;
            }
        }
        if (audio) {
            sounds[base] = {audio: `/sounds/${audio}`,
                            description: `/descriptions/${descr}`};
        } else {
            sounds[base] = {description: `/descriptions/${descr}`};
        }
    }
    fs.writeFileSync('sounds.json', JSON.stringify(sounds));
}


main();
