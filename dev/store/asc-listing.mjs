// The App Store listing of Pirith (lk.pitaka.pirith, app id 1503645003): makes sure there is an editable version
// VERSION (default 3.0), puts the texts of store-text.mjs and the screenshots of screenshots.mjs (en) on it and
// attaches the newest processed build of that version. Nothing is public until the version is sent for review
// and approved:
//   node dev/store/asc-listing.mjs             texts, screenshots and build
//   node dev/store/asc-listing.mjs --submit    and send it for review
// Uses the App Store Connect helper of the pitaka.lk repo (PITAKA_DEV), with its key.
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { apple } from './store-text.mjs'

const APP = '1503645003', LOCALE = 'en-US', VERSION = process.env.VERSION || '3.0'
const DIR = join(dirname(fileURLToPath(import.meta.url)), 'build/en')
// the store scales these two down for the smaller iPhones and iPads
const SETS = [['APP_IPHONE_67', 'apple-iphone-6.9'], ['APP_IPAD_PRO_3GEN_129', 'apple-ipad-13']]
if (apple.keywords.length > 100 || apple.promotionalText.length > 170 || apple.description.length > 4000) throw new Error('a text is too long')
if (/[඀-෿]/.test(JSON.stringify(apple))) throw new Error('Sinhala letters are not allowed in the en-US texts')

const { api, EDITABLE } = await import(join(process.env.PITAKA_DEV || '/Volumes/2TB/node/pitaka.lk/dev', 'apple/asc.mjs'))

const versions = (await api('GET', `/v1/apps/${APP}/appStoreVersions?filter[platform]=IOS&fields[appStoreVersions]=versionString,appVersionState`)).data
let version = versions.find(v => EDITABLE.includes(v.attributes.appVersionState))
if (!version) {
  version = (await api('POST', '/v1/appStoreVersions', { data: { type: 'appStoreVersions', attributes: { platform: 'IOS', versionString: VERSION },
    relationships: { app: { data: { type: 'apps', id: APP } } } } })).data
  console.log('created version', VERSION)
} else if (version.attributes.versionString !== VERSION) {
  await api('PATCH', `/v1/appStoreVersions/${version.id}`, { data: { type: 'appStoreVersions', id: version.id, attributes: { versionString: VERSION } } })
  console.log(`version ${version.attributes.versionString} -> ${VERSION}`)
}

const loc = (await api('GET', `/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations`)).data.find(l => l.attributes.locale === LOCALE)
if (!loc) throw new Error(`no ${LOCALE} localization`)
await api('PATCH', `/v1/appStoreVersionLocalizations/${loc.id}`, { data: { type: 'appStoreVersionLocalizations', id: loc.id, attributes: {
  description: apple.description, whatsNew: apple.whatsNew, promotionalText: apple.promotionalText, keywords: apple.keywords } } })
console.log('texts', LOCALE)

const sets = (await api('GET', `/v1/appStoreVersionLocalizations/${loc.id}/appScreenshotSets`)).data
for (const s of sets.filter(s => !SETS.some(([type]) => type === s.attributes.screenshotDisplayType))) {
  await api('DELETE', `/v1/appScreenshotSets/${s.id}`)
  console.log('removed', s.attributes.screenshotDisplayType)
}
for (const [type, folder] of SETS) {
  const set = sets.find(s => s.attributes.screenshotDisplayType === type) ?? (await api('POST', '/v1/appScreenshotSets', { data: { type: 'appScreenshotSets',
    attributes: { screenshotDisplayType: type }, relationships: { appStoreVersionLocalization: { data: { type: 'appStoreVersionLocalizations', id: loc.id } } } } })).data
  for (const s of (await api('GET', `/v1/appScreenshotSets/${set.id}/appScreenshots`)).data) await api('DELETE', `/v1/appScreenshots/${s.id}`)
  for (const fileName of readdirSync(join(DIR, folder)).filter(f => f.endsWith('.png')).sort()) {
    const bytes = readFileSync(join(DIR, folder, fileName))
    const shot = (await api('POST', '/v1/appScreenshots', { data: { type: 'appScreenshots', attributes: { fileName, fileSize: bytes.length },
      relationships: { appScreenshotSet: { data: { type: 'appScreenshotSets', id: set.id } } } } })).data
    for (const op of shot.attributes.uploadOperations) {
      const r = await fetch(op.url, { method: op.method, headers: Object.fromEntries(op.requestHeaders.map(h => [h.name, h.value])),
        body: bytes.subarray(op.offset, op.offset + op.length) })
      if (!r.ok) throw new Error(`upload ${fileName}: ${r.status}`)
    }
    await api('PATCH', `/v1/appScreenshots/${shot.id}`, { data: { type: 'appScreenshots', id: shot.id,
      attributes: { uploaded: true, sourceFileChecksum: createHash('md5').update(bytes).digest('hex') } } })
    console.log(' ', type, fileName)
  }
}

const builds = (await api('GET', `/v1/builds?filter[app]=${APP}&filter[processingState]=VALID&filter[preReleaseVersion.version]=${VERSION}` +
  `${process.env.BUILD ? `&filter[version]=${process.env.BUILD}` : ''}&sort=-uploadedDate&limit=1`)).data
if (!builds.length) throw new Error(`no processed build of ${VERSION}`)
await api('PATCH', `/v1/appStoreVersions/${version.id}/relationships/build`, { data: { type: 'builds', id: builds[0].id } })
console.log('build', builds[0].attributes.version)

if (process.argv.includes('--submit')) {
  const sub = (await api('GET', `/v1/reviewSubmissions?filter[app]=${APP}&filter[platform]=IOS&filter[state]=READY_FOR_REVIEW`)).data[0]
    ?? (await api('POST', '/v1/reviewSubmissions', { data: { type: 'reviewSubmissions', attributes: { platform: 'IOS' },
      relationships: { app: { data: { type: 'apps', id: APP } } } } })).data
  await api('POST', '/v1/reviewSubmissionItems', { data: { type: 'reviewSubmissionItems',
    relationships: { reviewSubmission: { data: { type: 'reviewSubmissions', id: sub.id } }, appStoreVersion: { data: { type: 'appStoreVersions', id: version.id } } } } })
  await api('PATCH', `/v1/reviewSubmissions/${sub.id}`, { data: { type: 'reviewSubmissions', id: sub.id, attributes: { submitted: true } } })
  console.log('submitted for review', VERSION)
}
