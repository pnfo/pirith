/**
 * node dev/long-vowels.js dev/data/63-combi.txt [--write]
 *
 * Pali printed in Sinhala script writes e and o short (මෙත්ත, හොති), but they are chanted long
 * unless a hal letter (a consonant with ්, i.e. a conjunct) follows: හෝති, යේන but මෙත්ත, සෙට්ඨ.
 * This lengthens the independent (එ ඔ) and dependent (ෙ ො) vowels of the Pali side of a combi
 * file (the part before "=") to match the chanting. Without --write it only prints the result.
 */
import fs from 'node:fs'

const C = '[ක-ෆ]', LONG = { 'එ': 'ඒ', 'ඔ': 'ඕ', 'ෙ': 'ේ', 'ො': 'ෝ' }
export const longVowels = (pali) => pali.normalize('NFC').replace(new RegExp(`[එඔෙො](?!${C}්)`, 'g'), v => LONG[v])

if (import.meta.filename === process.argv[1] || process.argv[1]?.endsWith('long-vowels.js')) {
  const file = process.argv[2]
  if (!file) throw new Error('usage: node dev/long-vowels.js <combi file> [--write]')
  const out = fs.readFileSync(file, 'utf8').split('\n').map(line => {
    const eq = line.indexOf('=')
    return eq < 0 ? longVowels(line) : longVowels(line.slice(0, eq)) + line.slice(eq)
  }).join('\n')
  if (process.argv.includes('--write')) fs.writeFileSync(file, out)
  else console.log(out)
}
