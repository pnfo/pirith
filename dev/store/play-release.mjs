// Uploads the signed bundle (Android: ./gradlew bundleRelease) and releases it on a track of Google Play with the
// notes of store-text.mjs. TRACK defaults to internal (testers only); TRACK=production is the public release.
//   node dev/store/play-release.mjs [--dry]     (--dry uploads, then drops the edit: nothing is released)
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { releaseNotes } from './store-text.mjs'

process.env.PACKAGE ||= 'lk.pitaka.pirith'
process.env.PLAY_KEY ||= '/Volumes/2TB/node/api-keys/play-console-api-key.json'
const AAB = process.env.AAB || join(dirname(fileURLToPath(import.meta.url)), '../../Android/app/build/outputs/bundle/release/app-release.aab')
const TRACK = process.env.TRACK || 'internal'
const { api } = await import(join(process.env.PITAKA_DEV || '/Volumes/2TB/node/pitaka.lk/dev', 'play/play.mjs'))

const e = `/edits/${(await api('POST', '/edits')).id}`
try {
  const bundle = await api('POST', `${e}/bundles`, { bytes: readFileSync(AAB), type: 'application/octet-stream' })
  console.log('bundle', bundle.versionCode)
  await api('PUT', `${e}/tracks/${TRACK}`, { track: TRACK, releases: [{ status: 'completed', versionCodes: [String(bundle.versionCode)],
    releaseNotes: Object.entries(releaseNotes).map(([language, text]) => ({ language, text })) }] })
  if (process.argv.includes('--dry')) {
    await api('DELETE', e)
    console.log('dry run: edit dropped')
  } else {
    await api('POST', `${e}:commit`).catch(err => {
      if (!/changesNotSentForReview/.test(err.message)) throw err
      return api('POST', `${e}:commit?changesNotSentForReview=true`).then(() => console.log('not sent for review: send it in the Play console'))
    })
    console.log(TRACK, 'committed')
  }
} catch (err) {
  await api('DELETE', e).catch(() => {})
  throw err
}
