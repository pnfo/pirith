# pirith

Paritta (pirith) chanting with the Pali text and its Sinhala / English meaning highlighted in time with the audio.
Web: https://pitaka.lk/pirith · Android and iOS apps: `lk.pitaka.pirith`.

Vue 3 + Vite + Tailwind + Pinia. No server: the web site is static files, the apps bundle the same code.

## Commands
```
npm install
npm run dev          # http://localhost:5173/pirith/
npm run data-gen     # dev/data -> public/data + src/generated/manifest.json
npm run build        # web: dist/  (every page prerendered to HTML, sitemap.xml)
npm run preview      # serve dist/ at http://localhost:4173/pirith/
npm run build:app    # apps: dist-app/ (hash routing, relative paths)
bash dev/deploy.sh   # build + dry run of the web deploy (see DEPLOY.md)
bash dev/sync-apps.sh  # build:app + copy into the Android and iOS projects
```

## Where things are
| | |
|---|---|
| `src/catalog.js` | the list of piriths, their names in every spelling, speakers and recordings |
| `dev/data/N-combi.txt` | text: `pali = sinhala` lines, groups separated by a blank line |
| `dev/data/N-trans.txt` | English, line for line with the combi file |
| `dev/data/timing/<speaker>/N-labels.txt` | start/end of every group for that speaker's recording (Audacity labels) |
| `dev/data/timing/<speaker>/N-words.json` | word times, made by `dev/align` |
| `public/audio/<speaker>/<id>.m4a` | audio |
| `dev/create-data.js` | `npm run data-gen` |
| `dev/prerender.js` | last step of `npm run build` |
| `src/seo.js` | titles, descriptions, canonical/hreflang, structured data |
| `src/player/` | `engine.js` (the one audio interface), `html.js` (web), `native.js` (apps), `sync.js` (text highlight) |
| `Android/`, `ios/` | the app projects |

## Adding or changing things
- **Fix text**: edit `dev/data/N-combi.txt` (and `N-trans.txt`), then `npm run data-gen`.
- **New pirith**: add it at the END of `piriths` in `src/catalog.js` (the order is stored in users' playlists), add
  the audio, combi, trans and labels files, then `npm run data-gen`.
- **New speaker**: add to `speakers` in `src/catalog.js`, put audio in `public/audio/<speaker>/` and labels in
  `dev/data/timing/<speaker>/`, and add `[speaker, 'm:ss']` to the `rec` list of each pirith they recorded. If they
  chant a different arrangement of the text, add `dev/data/N-combi.<speaker>.txt`.
- **Never rename an `id`** that is live: `pages/<id>.html` is what ranks in search.

Licence: CC BY-ND 4.0, copyright 2021 pathnirvana.
