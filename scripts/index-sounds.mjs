#! /usr/bin/env node

/** Script to create the file `sounds.json`
 *
 * This expects that the files are in `public/descriptions` and
 * `public/audio`. Each sound word should have files like `name.txt` and
 * `name.mp3`, with identical base names.  If a description file is
 * missing, the sound will not be indexed.
 *
 */

import fs from 'fs'

function main () {
  const sounds = {}
  const audioFiles = fs.readdirSync('public/audio')
  const descriptions = fs.readdirSync('public/descriptions')
  for (const descr of descriptions) {
    if (descr.includes('.txt')) {
      const base = descr.split('.txt')[0]
      sounds[base] = { description: `descriptions/${descr}` }
      const audio = `${base}.mp3`
      if (audioFiles.includes(audio)) { sounds[base].audio = `audio/${audio}` }
    }
  }
  fs.writeFileSync('public/sounds.json', JSON.stringify(sounds))
}

main()
