/**
 * The one audio interface the rest of the app talks to.
 *
 *   web      -> html.js    an <audio> element + the browser Media Session
 *   android  -> native.js  Media3/ExoPlayer service        (window.NativePlayer)
 *   ios      -> native.js  AVPlayer + Now Playing          (webkit.messageHandlers.nativePlayer)
 *
 * In the apps the QUEUE lives on the native side, so the next pirith starts on time
 * with the screen locked even if the WebView is asleep.
 *
 * track = { url, title, artist, album, artwork, ... }  (extra fields are kept by the caller)
 *
 * events (engine.on(fn)):
 *   { type: 'state', playing, index, position, duration, rate }
 *   { type: 'ended', index }     a track played to its end (not skipped)
 *   { type: 'queueEnd' }         the last track finished
 */
import { createHtmlBackend } from './html'
import { createNativeBackend, nativeTransport } from './native'

const listeners = new Set()
let backend = null

// last known state, used to work out the position between events
const st = { playing: false, index: -1, position: 0, duration: 0, rate: 1, at: 0 }
const now = () => (typeof performance !== 'undefined' ? performance.now() : 0)

function emit(evt) {
  if (evt.type === 'state') Object.assign(st, evt, { at: now() })
  if (evt.type === 'queueEnd') { st.playing = false; st.at = now() }
  listeners.forEach(fn => fn(evt))
}

function get() {
  if (!backend) backend = nativeTransport() ? createNativeBackend(emit) : createHtmlBackend(emit)
  return backend
}

export const engine = {
  isNative: () => !!nativeTransport(),
  on(fn) { listeners.add(fn); return () => listeners.delete(fn) },

  /** replace the queue. keep=true leaves the playing track untouched when it is tracks[index] */
  setQueue(tracks, index = 0, { play = true, position = 0, keep = false } = {}) {
    get().setQueue(tracks, index, { play, position, keep })
  },
  play() { get().play() },
  pause() { get().pause() },
  seek(seconds) { st.position = seconds; st.at = now(); get().seek(Math.max(0, seconds)) },
  setRate(rate) { get().setRate(rate) },
  next() { get().next() },
  previous() { get().previous() },
  /** pause after this many minutes (0 cancels). Native side keeps the timer so it fires when locked */
  sleepIn(minutes) { get().sleepIn(minutes) },

  /** current position in seconds - smooth, safe to call every animation frame */
  position() {
    if (backend?.position) return backend.position()
    if (!st.playing) return st.position
    return Math.min(st.position + ((now() - st.at) / 1000) * st.rate, st.duration || Infinity)
  },
  state: st,
}
