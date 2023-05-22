#! /usr/bin/env node

/** Script to copy old Finnish Ääninen files to correct locations
 *
 * This should be relevant only to those in possession of the old
 * files, and will be removed from the repository in the future.
 *
 * This expects that the files are located in `originals/audio`
 * and in `originals/descriptions`.
 *
 * After running this script, the script `decode-sound-files.sh`
 * should be run.
 *
 */

import fs from 'fs'

function main () {
  const audioFiles = fs.readdirSync('originals/audio')
  const descriptions = fs.readdirSync('originals/descriptions')
  for (const descr of descriptions) {
    const base = descr.split('.txt')[0]
    // Take only the descriptions that do not have a number
    if (['1', '2', '3'].includes(base[base.length - 1])) {
      continue
    }
    fs.copyFileSync(
            `originals/descriptions/${descr}`,
            `public/descriptions/${descr}`
    )
    // Take the first existing audio from the suffix list below
    for (const suffix of ['', 1, 2, 3]) {
      const candidate = `${base}${suffix}.mp3`
      const targetName = `${base}.mp3`
      if (audioFiles.includes(candidate)) {
        fs.copyFileSync(
                    `originals/audio/${candidate}`,
                    `public/audio/${targetName}`
        )
        if (suffix !== '') {
          const descrCandidate = `${base}${suffix}.txt`
          if (descriptions.includes(descrCandidate)) {
            let sample = fs.readFileSync(
                            `originals/descriptions/${descrCandidate}`)
            sample = String(sample).split('txtSelitys=')[1]
            sample = sample.replace('Max', 'mies')
            sample = (sample.charAt(0).toLowerCase() +
                                  sample.slice(1))
            fs.appendFileSync(
                            `public/descriptions/${descr}`,
                            `\r\nNäyte: ${sample}`
            )
          }
        }
        break
      }
    }
  }
}

main()
