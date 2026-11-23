// The Google Play listing of lk.pitaka.pirith: the texts of store-text.mjs and the images of screenshots.mjs
// (play-phone -> phone, play-tablet-10 -> 7" and 10" tablets, play-feature.png), for en-US and si-LK, in one edit.
//   node dev/store/play-listing.mjs            prints the texts and what would be uploaded - changes nothing
//   node dev/store/play-listing.mjs --go       replaces the listing. It is PUBLIC as soon as Google has checked it.
//   ICON=path/to/512.png adds the store icon.
// Uses the Play API helper of the pitaka.lk repo (PITAKA_DEV) and the key in api-keys.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { play } from './store-text.mjs'

process.env.PACKAGE ||= 'lk.pitaka.pirith'
process.env.PLAY_KEY ||= '/Volumes/2TB/node/api-keys/play-console-api-key.json'
const SHOTS = join(dirname(fileURLToPath(import.meta.url)), 'build')
const DIR = { 'en-US': 'en', 'si-LK': 'si' }
const IMAGES = [['phoneScreenshots', 'play-phone'], ['sevenInchScreenshots', 'play-tablet-10'], ['tenInchScreenshots', 'play-tablet-10'], ['featureGraphic', 'play-feature.png']]
if (process.env.ICON) IMAGES.push(['icon', process.env.ICON])

const filesOf = (lang, from) => from.endsWith('.png')
  ? [from.startsWith('/') ? from : join(SHOTS, DIR[lang], from)]
  : readdirSync(join(SHOTS, DIR[lang], from)).filter(f => f.endsWith('.png')).sort().map(f => join(SHOTS, DIR[lang], from, f))

for (const [lang, l] of Object.entries(play)) {
  if (l.title.length > 30 || l.shortDescription.length > 80 || l.fullDescription.length > 4000)
    throw new Error(`${lang} too long: ${l.title.length}/30, ${l.shortDescription.length}/80, ${l.fullDescription.length}/4000`)
  for (const [type, from] of IMAGES) for (const f of filesOf(lang, from)) if (!existsSync(f)) throw new Error(`missing ${f}`)
}
if (!process.argv.includes('--go')) {
  for (const [lang, l] of Object.entries(play)) {
    console.log(`\n===== ${lang} =====\n${l.title}\n${l.shortDescription}  (${l.shortDescription.length}/80)\n\n${l.fullDescription}\n(${l.fullDescription.length}/4000)`)
    for (const [type, from] of IMAGES) console.log(' ', type, filesOf(lang, from).length)
  }
  console.log('\nDry run. Add --go to replace the listing on Google Play.')
  process.exit(0)
}

const { api } = await import(join(process.env.PITAKA_DEV || '/Volumes/2TB/node/pitaka.lk/dev', 'play/play.mjs'))
const e = `/edits/${(await api('POST', '/edits')).id}`
try {
  for (const [lang, l] of Object.entries(play)) {
    await api('PUT', `${e}/listings/${lang}`, { language: lang, ...l })
    console.log('listing', lang)
    for (const [type, from] of IMAGES) {
      await api('DELETE', `${e}/listings/${lang}/${type}`)
      const files = filesOf(lang, from)
      for (const f of files) await api('POST', `${e}/listings/${lang}/${type}`, { bytes: readFileSync(f), type: 'image/png' })
      console.log(' ', type, files.length)
    }
  }
  await api('POST', `${e}:commit`)
  console.log('committed')
} catch (err) {
  await api('DELETE', e).catch(() => {})
  throw err
}
