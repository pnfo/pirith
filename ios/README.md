# Pirith for iOS

A WKWebView showing the pirith web app (`Pirith/www`, the `npm run build:app` output) with the audio played by
`Pirith/Player.swift`: background playback, lock screen / Control Centre, headset and CarPlay buttons.

```
ios/build-ios.sh sim                 # build for the simulator
ios/build-ios.sh archive             # signed .ipa in ios/build/export
ios/build-ios.sh archive --upload    # ... and upload to TestFlight (needs ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_PATH)
```

- `project.yml` is the source of the Xcode project (XcodeGen); `Pirith.xcodeproj` is generated, do not edit it.
- `VERSION=3.1 ios/build-ios.sh archive` sets the app version. It must be higher than the one in the App Store.
- Bundle id `lk.pitaka.pirith`, so this ships as an update of the existing app. Playlists saved by the old app are
  copied over on first launch (`OldStorage` in `App.swift`) if the old app kept them in a file:// web view.
- The bridge between the web code and `Player.swift` is described at the top of `src/player/native.js`.
- Lock-screen behaviour can only be judged on a real iPhone: play a playlist, lock the phone, check that the next
  pirith starts, that the lock screen shows title/artwork/seek bar, and that a phone call pauses and resumes it.
- `Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png` was scaled up from the 512 px Android icon. Replace it with a
  proper 1024 px icon (no transparency) before a store release.
