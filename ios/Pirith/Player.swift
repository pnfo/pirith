// Plays the pirith audio for the web app and connects it to iOS: lock screen and Control Centre (Now Playing),
// headset / CarPlay / bluetooth buttons (remote commands), phone calls and other apps (interruptions) and
// unplugged headphones (route changes). The queue is kept here, so the next pirith starts with the screen
// locked even when the web view is asleep.
//
// Bridge - documented in src/player/native.js:
//   web -> native   webkit.messageHandlers.nativePlayer.postMessage({ cmd: setQueue | play | pause | seek | setRate | next | previous | sleepIn, ... })
//   native -> web   window.__pirithNative({ type: state | ended | queueEnd, ... })   positions in seconds
import AVFoundation
import MediaPlayer
import UIKit

final class NativePlayer: NSObject {
    private struct Track {
        let url: String, title: String, artist: String, album: String, artwork: String
    }

    private let root: URL                   // the www folder in the bundle
    private let send: (String) -> Void      // JSON of one event, to the web view
    private let player = AVPlayer()
    private var queue: [Track] = []
    private var index = -1
    private var rate: Float = 1
    private var wantsToPlay = false
    private var sleepWork: DispatchWorkItem?
    private var statusObservation: NSKeyValueObservation?
    private var itemObservation: NSKeyValueObservation?
    private var artworkCache: [String: MPMediaItemArtwork] = [:]

    init(root: URL, send: @escaping (String) -> Void) {
        self.root = root
        self.send = send
        super.init()
        player.automaticallyWaitsToMinimizeStalling = false // local files: start at once

        statusObservation = player.observe(\.timeControlStatus) { [weak self] _, _ in
            DispatchQueue.main.async { self?.emitState() }
        }
        let center = NotificationCenter.default
        center.addObserver(self, selector: #selector(itemEnded(_:)), name: .AVPlayerItemDidPlayToEndTime, object: nil)
        center.addObserver(self, selector: #selector(interrupted(_:)), name: AVAudioSession.interruptionNotification, object: nil)
        center.addObserver(self, selector: #selector(routeChanged(_:)), name: AVAudioSession.routeChangeNotification, object: nil)
        center.addObserver(self, selector: #selector(becameActive), name: UIApplication.didBecomeActiveNotification, object: nil)
        setupRemoteCommands()
    }

    // MARK: - commands from the web app

    func run(_ c: [String: Any]) {
        switch c["cmd"] as? String {
        case "setQueue": setQueue(c)
        case "play": play()
        case "pause": pause()
        case "seek": seek(to: number(c["position"]))
        case "setRate":
            rate = Float(number(c["rate"], 1))
            if player.rate != 0 { player.rate = rate }
            emitState()
        case "next": next()
        case "previous": previous()
        case "sleepIn": sleepIn(minutes: number(c["minutes"]))
        default: break
        }
    }

    func stop() {
        wantsToPlay = false
        player.pause()
        player.replaceCurrentItem(with: nil)
        queue = []
        index = -1
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
    }

    private func setQueue(_ c: [String: Any]) {
        let tracks = (c["tracks"] as? [[String: Any]] ?? []).map {
            Track(url: $0["url"] as? String ?? "", title: $0["title"] as? String ?? "", artist: $0["artist"] as? String ?? "",
                  album: $0["album"] as? String ?? "", artwork: $0["artwork"] as? String ?? "")
        }
        guard !tracks.isEmpty else { return }
        let i = min(max(Int(number(c["index"])), 0), tracks.count - 1)
        // keep: the playlist was edited while playing - swap the queue around the pirith that is playing
        if (c["keep"] as? Bool) == true, queue.indices.contains(index), queue[index].url == tracks[i].url, player.currentItem != nil {
            queue = tracks
            index = i
            emitState()
            return
        }
        queue = tracks
        load(i, position: number(c["position"]), play: (c["play"] as? Bool) ?? true)
    }

    private func load(_ i: Int, position: Double = 0, play: Bool) {
        guard queue.indices.contains(i) else { return }
        index = i
        let item = AVPlayerItem(url: root.appendingPathComponent(queue[i].url))
        item.audioTimePitchAlgorithm = .timeDomain // other speeds keep the pitch of the voice
        itemObservation = item.observe(\.status) { [weak self] _, _ in
            DispatchQueue.main.async { self?.emitState() } // the duration is known now
        }
        player.replaceCurrentItem(with: item)
        if position > 0 { player.seek(to: time(position), toleranceBefore: .zero, toleranceAfter: .zero) }
        if play { self.play() } else { emitState() }
    }

    private func play() {
        guard player.currentItem != nil else { return }
        wantsToPlay = true
        try? AVAudioSession.sharedInstance().setActive(true)
        player.play()
        if rate != 1 { player.rate = rate }
        emitState()
    }

    private func pause() {
        wantsToPlay = false
        player.pause()
        emitState()
    }

    private func seek(to seconds: Double) {
        player.seek(to: time(seconds), toleranceBefore: .zero, toleranceAfter: .zero) { [weak self] _ in
            DispatchQueue.main.async { self?.emitState() }
        }
    }

    private func next() {
        if index + 1 < queue.count { load(index + 1, play: true) }
    }

    /// restarts the pirith, or goes to the one before when it has only just begun
    private func previous() {
        if position > 3 || index <= 0 { seek(to: 0) } else { load(index - 1, play: true) }
    }

    private func sleepIn(minutes: Double) {
        sleepWork?.cancel()
        sleepWork = nil
        guard minutes > 0 else { return }
        let work = DispatchWorkItem { [weak self] in self?.pause() }
        sleepWork = work
        DispatchQueue.main.asyncAfter(deadline: .now() + minutes * 60, execute: work)
    }

    // MARK: - what the system tells us

    @objc private func itemEnded(_ note: Notification) {
        guard (note.object as? AVPlayerItem) === player.currentItem else { return }
        emit(["type": "ended", "index": index])
        if index + 1 < queue.count {
            load(index + 1, play: true)
        } else {
            wantsToPlay = false
            emitState()
            emit(["type": "queueEnd"])
        }
    }

    /// a phone call, an alarm, another app taking the audio
    @objc private func interrupted(_ note: Notification) {
        guard let raw = note.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt,
              let type = AVAudioSession.InterruptionType(rawValue: raw) else { return }
        if type == .began {
            emitState() // the system has paused the player
        } else if wantsToPlay, let optionsRaw = note.userInfo?[AVAudioSessionInterruptionOptionKey] as? UInt,
                  AVAudioSession.InterruptionOptions(rawValue: optionsRaw).contains(.shouldResume) {
            play()
        }
    }

    /// headphones unplugged or bluetooth gone: stay paused (do not start chanting from the speaker)
    @objc private func routeChanged(_ note: Notification) {
        guard let raw = note.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt,
              AVAudioSession.RouteChangeReason(rawValue: raw) == .oldDeviceUnavailable else { return }
        DispatchQueue.main.async { self.pause() }
    }

    @objc private func becameActive() { emitState() } // the web view may have missed updates while in the background

    private func setupRemoteCommands() {
        let c = MPRemoteCommandCenter.shared()
        c.playCommand.addTarget { [weak self] _ in self?.play(); return .success }
        c.pauseCommand.addTarget { [weak self] _ in self?.pause(); return .success }
        c.togglePlayPauseCommand.addTarget { [weak self] _ in
            guard let self else { return .commandFailed }
            if self.player.timeControlStatus == .paused { self.play() } else { self.pause() }
            return .success
        }
        c.nextTrackCommand.addTarget { [weak self] _ in self?.next(); return .success }
        c.previousTrackCommand.addTarget { [weak self] _ in self?.previous(); return .success }
        c.changePlaybackPositionCommand.addTarget { [weak self] event in
            guard let e = event as? MPChangePlaybackPositionCommandEvent else { return .commandFailed }
            self?.seek(to: e.positionTime)
            return .success
        }
    }

    // MARK: - state to the web app and to the lock screen

    private var position: Double {
        let s = player.currentTime().seconds
        return s.isFinite ? max(s, 0) : 0
    }

    private var duration: Double {
        let s = player.currentItem?.duration.seconds ?? 0
        return s.isFinite ? s : 0
    }

    private func emitState() {
        guard index >= 0 else { return }
        let playing = player.timeControlStatus == .playing
        emit(["type": "state", "playing": playing, "index": index, "position": position, "duration": duration, "rate": Double(rate)])
        updateNowPlaying(playing: playing)
    }

    private func emit(_ event: [String: Any]) {
        guard let data = try? JSONSerialization.data(withJSONObject: event), let json = String(data: data, encoding: .utf8) else { return }
        send(json)
    }

    private func updateNowPlaying(playing: Bool) {
        guard queue.indices.contains(index) else { return }
        let t = queue[index]
        var info: [String: Any] = [
            MPMediaItemPropertyTitle: t.title,
            MPMediaItemPropertyArtist: t.artist,
            MPMediaItemPropertyAlbumTitle: t.album,
            MPNowPlayingInfoPropertyElapsedPlaybackTime: position,
            MPNowPlayingInfoPropertyPlaybackRate: playing ? Double(rate) : 0,
            MPNowPlayingInfoPropertyDefaultPlaybackRate: Double(rate),
            MPNowPlayingInfoPropertyPlaybackQueueIndex: index,
            MPNowPlayingInfoPropertyPlaybackQueueCount: queue.count,
        ]
        if duration > 0 { info[MPMediaItemPropertyPlaybackDuration] = duration }
        if let art = artwork(t.artwork) { info[MPMediaItemPropertyArtwork] = art }
        MPNowPlayingInfoCenter.default().nowPlayingInfo = info
        let c = MPRemoteCommandCenter.shared()
        c.nextTrackCommand.isEnabled = index + 1 < queue.count
        c.previousTrackCommand.isEnabled = true
    }

    private func artwork(_ path: String) -> MPMediaItemArtwork? {
        if path.isEmpty { return nil }
        if let cached = artworkCache[path] { return cached }
        guard let image = UIImage(contentsOfFile: root.appendingPathComponent(path).path) else { return nil }
        let art = MPMediaItemArtwork(boundsSize: image.size) { _ in image }
        artworkCache[path] = art
        return art
    }

    private func time(_ seconds: Double) -> CMTime { CMTime(seconds: max(seconds, 0), preferredTimescale: 1000) }

    private func number(_ value: Any?, _ fallback: Double = 0) -> Double {
        (value as? NSNumber)?.doubleValue ?? fallback
    }
}
