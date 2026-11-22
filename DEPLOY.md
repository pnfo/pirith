# Deploying pirith

pirith is built and deployed from this repo on its own. It is no longer part of the pitaka.lk repo.

## Web: pitaka.lk/pirith

```
bash dev/deploy.sh          # build, then DRY RUN against the server - changes nothing
bash dev/deploy.sh --go     # build and deploy
```

- `npm run build` writes `dist/`: one real HTML file per page (`pages/<id>.html`, `en/pages/<id>.html`, home, settings),
  `sitemap.xml`, the per-pirith data in `data/`, and `audio/<speaker>/`.
- The script rsyncs `dist/` to `$DEPLOY_HOST:$DEPLOY_ROOT/pirith/` (default `tipitaka.lk:/var/www/html/pitaka.lk` -
  pitaka.lk and tipitaka.lk are on the same droplet, reached with `ssh tipitaka.lk`)
  with `--delete` limited to that folder. No sudo, no secrets.
- Always read the dry run first. `*deleting` lines are files that will be removed from the server.
- The web build assumes it is served under `/pirith/`. To host it elsewhere: `PIRITH_BASE=/ npm run build`
  and change `SITE` in `src/seo.js`.
- **Never run `git pull` in the server's web root** - the pitaka.lk history was rewritten.

### Two lines that live in the pitaka.lk repo (server config)
These are not required for the site to work, but both are worth doing once:
1. `nginx/pitaka.lk.conf` - the catch-all location sends `expires epoch`, so the hashed JS/CSS/font files are
   re-downloaded on every visit. Add:
   ```
   location /pirith/assets/ { expires 1y; add_header Cache-Control "public, immutable"; }
   location /pirith/data/   { expires 1d; }
   ```
2. `robots.txt` at the site root - add `Sitemap: https://pitaka.lk/pirith/sitemap.xml`, and submit the sitemap in
   Search Console.

### The first deploy of the 2026 rebuild
- The URLs `pitaka.lk/pirith/pages/<id>.html` are unchanged; they are now full pages with the player.
- Audio moved from `audio/<id>.m4a` to `audio/<speaker>/<id>.m4a`, so the dry run lists the old audio files as
  `*deleting` and the new ones as new. That is expected.

## Apps (Android and iOS)

```
bash dev/sync-apps.sh       # npm run build:app, then copy dist-app/ into both app projects
```

- Android: `./Android` is a symlink to the `Pirith-android-app` repo. Then build there with Android Studio or
  `./gradlew bundleRelease`.
- iOS: `./ios` (XcodeGen). See `ios/README.md`.
- Audio is played by the native player in both apps. The contract between the web code and the native side is
  documented at the top of `src/player/native.js`.

## Related
- pitaka.lk static sites and server config: github.com/pathnirvana/pitaka.lk (`dev/deploy.sh`, `nginx/`).
- Old full history, including earlier pirith builds: github.com/pathnirvana/pitaka.lk-archive.
