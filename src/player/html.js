/** Browser backend: one <audio> element, queue kept here, lock-screen controls via Media Session. */
export function createHtmlBackend(emit) {
  const audio = new Audio()
  audio.preload = 'auto'
  let queue = [], index = -1, rate = 1, sleepTimer = null, pendingSeek = 0

  const state = () => emit({
    type: 'state', playing: !audio.paused && !audio.ended, index,
    position: audio.currentTime || 0, duration: isFinite(audio.duration) ? audio.duration : 0, rate,
  })

  function load(i, { play = true, position = 0 } = {}) {
    index = i
    const track = queue[i]
    if (!track) return
    // src must be set synchronously (inside the 'ended' handler) or mobile browsers stop background audio
    audio.src = track.url
    audio.playbackRate = rate
    pendingSeek = position
    if (position > 0) { try { audio.currentTime = position } catch (e) { /* applied on loadedmetadata */ } }
    setMetadata(track)
    if (play) audio.play().catch(() => state())
    state()
  }

  function setMetadata(track) {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title, artist: track.artist, album: track.album, artwork: track.artwork || [],
    })
  }

  function positionState() {
    if (!('mediaSession' in navigator) || !isFinite(audio.duration) || !audio.duration) return
    try {
      navigator.mediaSession.setPositionState({
        duration: audio.duration, playbackRate: audio.playbackRate, position: Math.min(audio.currentTime, audio.duration),
      })
    } catch (e) { /* older browsers */ }
  }

  audio.addEventListener('loadedmetadata', () => {
    if (pendingSeek > 0 && Math.abs(audio.currentTime - pendingSeek) > 1) audio.currentTime = pendingSeek
    pendingSeek = 0
    state()
  })
  for (const e of ['playing', 'pause', 'seeked', 'ratechange', 'durationchange', 'waiting']) {
    audio.addEventListener(e, () => { state(); positionState() })
  }
  audio.addEventListener('ended', () => {
    emit({ type: 'ended', index })
    if (index + 1 < queue.length) load(index + 1)
    else { state(); emit({ type: 'queueEnd' }) }
  })
  audio.addEventListener('error', () => { if (audio.src) console.warn('audio error', audio.error?.message, audio.src); state() })

  const api = {
    setQueue(tracks, i, { play, position, keep }) {
      const same = keep && queue[index] && tracks[i] && queue[index].url === tracks[i].url
      queue = tracks
      if (same) { index = i; state() } else load(i, { play, position })
    },
    play() { if (index >= 0) audio.play().catch(() => state()) },
    pause() { audio.pause() },
    seek(s) { if (isFinite(audio.duration)) audio.currentTime = Math.min(s, audio.duration - 0.05); else pendingSeek = s },
    setRate(r) { rate = r; audio.playbackRate = r },
    next() { if (index + 1 < queue.length) load(index + 1) },
    previous() { if (audio.currentTime > 3 || index === 0) api.seek(0); else load(index - 1) },
    sleepIn(minutes) {
      clearTimeout(sleepTimer)
      if (minutes > 0) sleepTimer = setTimeout(() => audio.pause(), minutes * 60000)
    },
    position: () => audio.currentTime || 0,
  }

  if ('mediaSession' in navigator) {
    const ms = navigator.mediaSession
    const set = (name, fn) => { try { ms.setActionHandler(name, fn) } catch (e) { /* not supported */ } }
    set('play', () => api.play())
    set('pause', () => api.pause())
    set('nexttrack', () => api.next())
    set('previoustrack', () => api.previous())
    set('seekbackward', (d) => api.seek(Math.max(audio.currentTime - (d.seekOffset || 10), 0)))
    set('seekforward', (d) => api.seek(audio.currentTime + (d.seekOffset || 10)))
    set('seekto', (d) => api.seek(d.seekTime))
  }
  return api
}
