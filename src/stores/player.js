import { defineStore } from 'pinia'
import { piriths, speakers, recordingOf } from '@/catalog'
import { assetUrl } from '@/data'
import { engine } from '@/player/engine'

/**
 * Playlists, settings and what is playing.
 *
 * Storage keys and formats are the ones the site has always used, so returning
 * visitors and app users keep their playlists and listening counts:
 *   playlists      [{ name, list: [{ pInd, repeats }] }]   - playlists[0] is "all piriths"
 *   curPlInd, curPirith (pInd + 1), playMetrics [count per pInd], repeatCounts, darkMode
 */
const defaultPlaylists = () => [
  { name: 'සියලු‍ පිරිත්, All Paritta', list: piriths.map((p, pInd) => ({ pInd, repeats: 1 })) },
  { name: 'තුන් සූත්‍රය, Three Suttas', list: [{ pInd: 6, repeats: 1 }, { pInd: 7, repeats: 1 }, { pInd: 8, repeats: 1 }] },
  { name: 'ගැබිණි මවුන්, Pregnant Moms', list: [{ pInd: 31, repeats: 7 }, { pInd: 39, repeats: 1 }] },
]

const MAX_QUEUE = 600 // repeats are expanded into the queue; keep it bounded
const FONT_SIZES = ['0.9', '1', '1.15', '1.3', '1.5']

const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v) } catch (e) { return fallback }
  },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)) } catch (e) { /* private mode */ } },
}

let queue = []      // [{ lInd, pInd, rep, ...track }] - what the engine is playing
let unsubscribe = null

function setStatusBar(isDark) {
  window.Android?.setStatusBarColor?.(isDark ? '#292524' : '#2e4c37')
  window.webkit?.messageHandlers?.statusBar?.postMessage(isDark ? 'dark' : 'light')
}

export const usePlayerStore = defineStore('player', {
  state: () => ({
    loaded: false,
    playlists: defaultPlaylists(),
    plInd: 0,               // playlist shown on the home page
    playMetrics: [],
    repeatCounts: [1, 3, 7, 21, 108],
    darkMode: false,
    fontSize: '1',
    showMeaning: true,
    autoScroll: true,
    hideIntro: false,
    rate: 1,
    speaker: Object.keys(speakers)[0],

    // playback
    now: null,              // { plInd, lInd, pInd, rep, repeats } - the track loaded in the player
    playing: false,
    duration: 0,
    sleepAt: 0,             // epoch ms when the sleep timer fires, 0 = off
    activeDropdown: null,
  }),

  getters: {
    curPl: (s) => s.playlists[s.plInd] || s.playlists[0],
    nowPirith: (s) => (s.now ? piriths[s.now.pInd] : null),
    fontSizes: () => FONT_SIZES,
  },

  actions: {
    /** browser only, after hydration (so the prerendered page and the first client render agree) */
    load() {
      if (this.loaded) return
      this.loaded = true
      let playlists = store.get('playlists', null)
      if (store.get('pirith-version', 0) !== 3 || !Array.isArray(playlists) || !playlists.length) playlists = defaultPlaylists()
      store.set('pirith-version', 3)
      // drop anything that no longer exists, add piriths released since the last visit
      playlists.forEach(pl => { pl.list = pl.list.filter(e => piriths[e.pInd]) })
      piriths.forEach((p, pInd) => {
        if (!playlists[0].list.some(e => e.pInd === pInd)) playlists[0].list.push({ pInd, repeats: 1 })
      })
      this.playlists = playlists
      this.plInd = Math.min(store.get('curPlInd', 0), playlists.length - 1)
      this.playMetrics = store.get('playMetrics', [])
      this.repeatCounts = store.get('repeatCounts', this.repeatCounts)
      this.darkMode = store.get('darkMode', false) === true
      this.fontSize = String(store.get('fontSize', '1'))
      this.showMeaning = store.get('showMeaning', true)
      this.autoScroll = store.get('autoScroll', true)
      this.rate = store.get('rate', 1)
      this.hideIntro = store.get('hideIntro', false) === true
      document.documentElement.classList.toggle('dark', this.darkMode)
      setStatusBar(this.darkMode)

      // show the pirith played last time in the player bar (does not start it)
      const last = store.get('curPirith', 0) - 1
      if (piriths[last]) {
        const plInd = this.curPl.list.some(e => e.pInd === last) ? this.plInd : 0
        const lInd = this.playlists[plInd].list.findIndex(e => e.pInd === last)
        this.now = { plInd, lInd, pInd: last, rep: 1, repeats: this.playlists[plInd].list[lInd].repeats, idle: true }
      }
      unsubscribe?.()
      unsubscribe = engine.on((evt) => this.onEngine(evt))
    },

    // ---------- playback ----------
    trackFor(item, lInd, rep) {
      const p = piriths[item.pInd]
      const rec = recordingOf(p, this.speaker)
      const who = speakers[rec.speaker]
      return {
        lInd, pInd: item.pInd, rep, repeats: item.repeats,
        url: __APP__ ? rec.audio : assetUrl(rec.audio),
        title: `${p.pop} · ${p.sg[0]}`,
        artist: who.en,
        album: 'පිරිත් · Pirith',
        artwork: who.artwork.map(size => ({
          src: (__APP__ ? '' : assetUrl('')) + `artwork/${rec.speaker}-${size}.png`, sizes: `${size}x${size}`, type: 'image/png',
        })),
      }
    },
    /**
     * the queue of a playlist, repeats expanded: { tracks, index } with tracks[index] the entry to play.
     * What comes before it is in the queue too, so that "previous" has somewhere to go.
     */
    buildQueue(plInd, fromLInd, fromRep = 1) {
      const list = this.playlists[plInd].list
      const after = [], before = []
      for (let l = fromLInd; l < list.length && after.length < MAX_QUEUE; l++) {
        for (let rep = (l === fromLInd ? fromRep : 1); rep <= list[l].repeats && after.length < MAX_QUEUE; rep++) {
          after.push(this.trackFor(list[l], l, rep))
        }
      }
      for (let l = fromLInd; l >= 0 && before.length + after.length < MAX_QUEUE; l--) {
        for (let rep = (l === fromLInd ? fromRep - 1 : list[l].repeats); rep >= 1 && before.length + after.length < MAX_QUEUE; rep--) {
          before.unshift(this.trackFor(list[l], l, rep))
        }
      }
      return { tracks: before.concat(after), index: before.length }
    },
    /** start a playlist entry */
    play(plInd, lInd, position = 0) {
      const q = this.buildQueue(plInd, lInd)
      const t = q.tracks[q.index]
      if (!t) return
      queue = q.tracks
      this.now = { plInd, lInd, pInd: t.pInd, rep: 1, repeats: t.repeats }
      store.set('curPirith', t.pInd + 1)
      engine.setRate(this.rate)
      engine.setQueue(queue, q.index, { play: true, position })
    },
    /** start a pirith: inside the open playlist when it is there, else from the full list */
    playPirith(pInd, position = 0) {
      let plInd = this.plInd
      let lInd = this.curPl.list.findIndex(e => e.pInd === pInd)
      if (lInd < 0) { plInd = 0; lInd = this.playlists[0].list.findIndex(e => e.pInd === pInd) }
      if (lInd >= 0) this.play(plInd, lInd, position)
    },
    /** play/pause button of one pirith */
    togglePirith(pInd) {
      if (this.now?.pInd === pInd && !this.now.idle) this.toggle()
      else this.playPirith(pInd)
    },
    toggle() {
      if (!this.now) return
      if (this.now.idle) return this.play(this.now.plInd, this.now.lInd)
      this.playing ? engine.pause() : engine.play()
    },
    seek(seconds) {
      if (this.now?.idle) this.play(this.now.plInd, this.now.lInd, seconds)
      else engine.seek(seconds)
    },
    next() { engine.next() },
    previous() { engine.previous() },
    setRate(rate) { this.rate = rate; store.set('rate', rate); engine.setRate(rate) },
    setSleep(minutes) {
      this.sleepAt = minutes ? Date.now() + minutes * 60000 : 0
      engine.sleepIn(minutes)
    },
    /** the playing playlist was edited: rebuild what comes after the current track */
    refreshQueue() {
      const n = this.now
      if (!n || n.idle) return
      const list = this.playlists[n.plInd]?.list
      const lInd = list ? list.findIndex(e => e.pInd === n.pInd) : -1
      if (lInd < 0) return // current track was removed: let it finish, the old queue continues
      const q = this.buildQueue(n.plInd, lInd, Math.min(n.rep, list[lInd].repeats))
      queue = q.tracks
      this.now = { ...n, lInd, repeats: list[lInd].repeats, rep: queue[q.index].rep }
      engine.setQueue(queue, q.index, { keep: true })
    },
    onEngine(evt) {
      if (evt.type === 'state') {
        this.playing = evt.playing
        this.duration = evt.duration
        const t = queue[evt.index]
        if (t && (!this.now || this.now.idle || this.now.lInd !== t.lInd || this.now.rep !== t.rep || this.now.pInd !== t.pInd)) {
          this.now = { plInd: this.now?.plInd ?? 0, lInd: t.lInd, pInd: t.pInd, rep: t.rep, repeats: t.repeats }
          store.set('curPirith', t.pInd + 1)
        }
        if (this.sleepAt && Date.now() > this.sleepAt) this.sleepAt = 0
      } else if (evt.type === 'ended') {
        const t = queue[evt.index]
        if (t) { // only complete listens are counted
          this.playMetrics[t.pInd] = (this.playMetrics[t.pInd] || 0) + 1
          store.set('playMetrics', this.playMetrics)
        }
      } else if (evt.type === 'queueEnd') {
        this.playing = false
        if (this.now) this.now = { ...this.now, idle: true } // play starts this entry again
      }
    },

    // ---------- settings ----------
    setActiveDropdown(name) { this.activeDropdown = name },
    setPlInd(ind) { this.plInd = ind; store.set('curPlInd', ind) },
    setRepeatCounts(counts) { this.repeatCounts = counts; store.set('repeatCounts', counts) },
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      store.set('darkMode', this.darkMode)
      document.documentElement.classList.toggle('dark', this.darkMode)
      setStatusBar(this.darkMode)
    },
    stepFontSize(step) {
      const i = Math.max(0, Math.min(FONT_SIZES.length - 1, FONT_SIZES.indexOf(this.fontSize) + step))
      this.fontSize = FONT_SIZES[i]
      store.set('fontSize', this.fontSize)
      document.documentElement.style.setProperty('--reader-size', this.fontSize)
    },
    dismissIntro() { this.hideIntro = true; store.set('hideIntro', true) },
    toggleMeaning() { this.showMeaning = !this.showMeaning; store.set('showMeaning', this.showMeaning) },
    toggleAutoScroll() { this.autoScroll = !this.autoScroll; store.set('autoScroll', this.autoScroll) },

    // ---------- playlists ----------
    savePlaylists(plInd = this.plInd) {
      store.set('playlists', this.playlists)
      if (this.now && this.now.plInd === plInd) this.refreshQueue()
    },
    addToPlaylist({ plInd, pInd }) {
      if (this.playlists[plInd].list.some(e => e.pInd === pInd)) return false
      this.playlists[plInd].list.push({ pInd, repeats: 1 })
      this.savePlaylists(plInd)
      return true
    },
    deleteFromPlaylist({ plInd, lInd }) { this.playlists[plInd].list.splice(lInd, 1); this.savePlaylists(plInd) },
    moveInPlaylist(lInd, step) {
      const list = this.curPl.list, to = lInd + step
      if (to < 0 || to >= list.length) return
      list.splice(to, 0, list.splice(lInd, 1)[0])
      this.savePlaylists()
    },
    changeRepeats({ lInd, nr }) { this.curPl.list[lInd].repeats = nr; this.savePlaylists() },
    setPlaylistName(name) { this.curPl.name = name; this.savePlaylists() },
    addNewPlaylist(prefix) {
      const names = this.playlists.map(p => p.name)
      let n = 1
      while (names.includes(`${prefix} ${n}`)) n++
      this.playlists.push({ name: `${prefix} ${n}`, list: [] })
      this.setPlInd(this.playlists.length - 1)
      this.savePlaylists()
    },
    deletePlaylist() {
      if (this.plInd === 0) return
      const removed = this.plInd
      this.playlists.splice(removed, 1)
      this.setPlInd(0)
      if (this.now) {
        if (this.now.plInd === removed) this.now.plInd = 0
        else if (this.now.plInd > removed) this.now.plInd--
      }
      store.set('playlists', this.playlists)
    },
  },
})
