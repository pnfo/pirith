/**
 * Loads the per-pirith files made by `npm run data-gen` (public/data).
 * Text and timing are fetched one pirith at a time, only when needed.
 */
import { reactive } from 'vue'
import manifest from './generated/manifest.json'

export { manifest }

const texts = reactive({}) // key -> groups [[[pali, meaning]]]
const timings = {}         // "speaker/id" -> { text, g, w }
const pending = {}

export const textKey = (name, locale) => `${name}.${locale}`
export const hasText = (id) => manifest[id]?.groups > 0
export const assetUrl = (path) => import.meta.env.BASE_URL + path

export function primeText(key, groups) { texts[key] = groups }
export function getText(key) { return texts[key] || null }

function request(url) {
  // the Android app loads from file://, where fetch() is not allowed but XMLHttpRequest is
  if (__APP__) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', url)
      xhr.onload = () => { try { resolve(JSON.parse(xhr.responseText)) } catch (e) { reject(e) } }
      xhr.onerror = () => reject(new Error(`${url}: failed`))
      xhr.send()
    })
  }
  return fetch(url).then(r => {
    if (!r.ok) throw new Error(`${url}: ${r.status}`)
    return r.json()
  })
}

function fetchJson(path) {
  return pending[path] ||= request(assetUrl(path)).finally(() => { delete pending[path] })
}

/** @returns groups, or null when this pirith has no text yet */
export async function loadText(name, locale) {
  const key = textKey(name, locale)
  if (texts[key]) return texts[key]
  if (!hasText(name.split('.')[0])) return null
  try {
    texts[key] = (await fetchJson(`data/text/${key}.json`)).groups
  } catch (e) {
    console.warn(e)
    return null
  }
  return texts[key]
}

/** @returns { text, g: [[start,end]], w: word starts or null }, or null when there is no timing */
export async function loadTiming(id, speaker) {
  const key = `${speaker}/${id}`
  if (key in timings) return timings[key]
  const kind = manifest[id]?.timing?.[speaker]
  if (!kind || kind === 'none') return (timings[key] = null)
  try {
    timings[key] = await fetchJson(`data/timing/${key}.json`)
  } catch (e) {
    console.warn(e)
    return null
  }
  return timings[key]
}
