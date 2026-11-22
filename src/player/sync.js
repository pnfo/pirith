/**
 * Follows the audio position and says which group / line / word is being chanted.
 *
 * Timing data has a [start, end] for every group. Word starts ("w") exist once a
 * recording has been through dev/align; without them the line inside a group is
 * estimated from the length of each Pali line (the old behaviour).
 */
import { reactive, watch } from 'vue'
import { engine } from './engine'
import { loadTiming, loadText, getText, textKey } from '@/data'
import { piriths, recordingOf } from '@/catalog'

export const sync = reactive({
  id: null,       // pirith the timeline belongs to
  textName: null, // text file the timing was made for (differs per speaker when they chant another arrangement)
  ready: false,
  hasWords: false,
  g: -1, r: -1, w: -1,
})

let groups = []   // [{ start, end, rows: [{ start, words: [start...] | null }] }]
let raf = 0
let token = 0

function build(timing, text) {
  return timing.g.map(([start, end], g) => {
    const rows = text?.[g] || []
    const words = timing.w?.[g]
    if (words) return { start, end, rows: rows.map((_, r) => ({ start: words[r]?.[0] ?? start, words: words[r] || null })) }
    // estimate: time inside the group is shared out by the length of each Pali line
    const lens = rows.map(row => Math.max(row[0].length, 1))
    const total = lens.reduce((a, b) => a + b, 0) || 1
    let acc = 0
    return {
      start, end,
      rows: lens.map(len => { const s = start + (acc / total) * (end - start); acc += len; return { start: s, words: null } }),
    }
  })
}

/** last index whose start <= t */
function locate(arr, t, startOf) {
  let lo = 0, hi = arr.length - 1, ans = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (startOf(arr[mid]) <= t) { ans = mid; lo = mid + 1 } else hi = mid - 1
  }
  return ans
}

function update() {
  if (!sync.ready) return
  const t = engine.position() + 0.05
  let g = locate(groups, t, x => x.start)
  let r = -1, w = -1
  if (g >= 0) {
    const grp = groups[g]
    if (t > grp.end && g === groups.length - 1) g = -1 // after the last line
    else {
      r = Math.max(0, locate(grp.rows, t, x => x.start))
      const words = grp.rows[r]?.words
      if (words) w = Math.max(0, locate(words, t, x => x))
    }
  }
  if (g !== sync.g) sync.g = g
  if (r !== sync.r) sync.r = r
  if (w !== sync.w) sync.w = w
}

function loop() {
  update()
  raf = engine.state.playing ? requestAnimationFrame(loop) : 0
}

/** call once from the app shell */
export function startSync(store, localeRef) {
  const load = async () => {
    const my = ++token
    const n = store.now
    sync.ready = false; sync.g = sync.r = sync.w = -1
    groups = []
    if (!n) { sync.id = null; return }
    const p = piriths[n.pInd]
    sync.id = p.id
    const timing = await loadTiming(p.id, recordingOf(p, store.speaker).speaker)
    if (my !== token || !timing) return
    const text = await loadText(timing.text, localeRef.value)
    if (my !== token) return
    groups = build(timing, text)
    sync.textName = timing.text
    sync.hasWords = !!timing.w
    sync.ready = true
    update()
  }
  watch(() => [store.now?.pInd, localeRef.value], load, { immediate: true })
  engine.on((evt) => {
    if (evt.type !== 'state') return
    update()
    if (evt.playing && !raf) raf = requestAnimationFrame(loop)
  })
}

/** time at which a line starts, for tap-to-seek. null when unknown */
export function timeOf(g, r = 0) {
  const grp = groups[g]
  if (!grp) return null
  return grp.rows[r]?.start ?? grp.start
}

/** rows of the group being chanted, in the given language */
export function currentRows(locale) {
  if (!sync.ready || sync.g < 0) return null
  return getText(textKey(sync.textName, locale))?.[sync.g] || null
}
