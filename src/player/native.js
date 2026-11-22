/**
 * App backend: audio is played by the platform player, the WebView only sends commands.
 *
 * CONTRACT (the same on Android and iOS)
 *   JS -> native   one JSON message  { cmd, ...args }
 *       setQueue  { tracks: [{ url, title, artist, album, artwork }], index, play, position, keep }
 *                 url and artwork are paths relative to the web root (e.g. "audio/ariyadhamma/09-rathana.m4a")
 *       play | pause | next | previous
 *       seek      { position }   seconds
 *       setRate   { rate }
 *       sleepIn   { minutes }    0 cancels
 *   native -> JS   window.__pirithNative({ type, ... })  with the events described in engine.js
 *                  (positions and durations in seconds)
 *
 *   Android: window.NativePlayer.command(jsonString)
 *   iOS:     window.webkit.messageHandlers.nativePlayer.postMessage(object)
 */
export function nativeTransport() {
  if (typeof window === 'undefined') return null
  if (window.NativePlayer?.command) return (msg) => window.NativePlayer.command(JSON.stringify(msg))
  const ios = window.webkit?.messageHandlers?.nativePlayer
  if (ios) return (msg) => ios.postMessage(msg)
  return null
}

export function createNativeBackend(emit) {
  const send = nativeTransport()
  window.__pirithNative = (evt) => emit(typeof evt === 'string' ? JSON.parse(evt) : evt)

  const slim = (t) => ({
    url: t.url, title: t.title, artist: t.artist, album: t.album,
    artwork: t.artwork?.length ? t.artwork[t.artwork.length - 1].src : '',
  })
  return {
    setQueue: (tracks, index, opts) => send({ cmd: 'setQueue', tracks: tracks.map(slim), index, ...opts }),
    play: () => send({ cmd: 'play' }),
    pause: () => send({ cmd: 'pause' }),
    seek: (position) => send({ cmd: 'seek', position }),
    setRate: (rate) => send({ cmd: 'setRate', rate }),
    next: () => send({ cmd: 'next' }),
    previous: () => send({ cmd: 'previous' }),
    sleepIn: (minutes) => send({ cmd: 'sleepIn', minutes }),
  }
}
