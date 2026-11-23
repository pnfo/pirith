/**
 * Store screenshots of the pirith apps (Android and iOS show the same pages): a caption over each screen, at the
 * sizes of each store, in Sinhala (Play si-LK) and English (Play en-US, App Store), and the Play feature graphic.
 *   npm run build:app && node dev/store/screenshots.mjs [output…]
 *   -> dev/store/build/<lang>/<output>/<n>-<scene>.png, dev/store/build/<lang>/play-feature.png
 * dev/store/play-listing.mjs and asc-listing.mjs put them on the stores. Needs Google Chrome (CHROME=path).
 */
import { createReadStream, existsSync, mkdirSync, rmSync, statSync, writeFileSync, unlinkSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import puppeteer from 'puppeteer-core'
import { piriths } from '../../src/catalog.js'

const here = dirname(fileURLToPath(import.meta.url))
const REPO = join(here, '../..'), APP = join(REPO, 'dist-app'), OUT = join(here, 'build')
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const FONTS = '/Volumes/2TB/node/pitaka.lk/tools/unicode/fonts/web'
const font = (f) => pathToFileURL(join(FONTS, f)).href
const pInd = (id) => piriths.findIndex(p => p.id === id)

/** store image sizes; css: the width of the screen the app is shown at */
const OUTPUTS = {
  'play-phone': { w: 1080, h: 1920, css: 390 },
  'play-tablet-10': { w: 1600, h: 2560, css: 600 },
  'apple-iphone-6.9': { w: 1320, h: 2868, css: 400 },
  'apple-ipad-13': { w: 2064, h: 2752, css: 640 },
}

const MY_LIST = { name: 'උදෑසන පිරිත්, Morning', list: [['08-mahamangala', 1], ['09-rathana', 3], ['10-karaniya', 7], ['61-bojjhanga-parittam', 21]] }

/** page: the route; ui: the language of the app in that scene (default: the caption's); run: in the page, with the store */
const SCENES = [
  { id: 'home', page: '/',
    si: ['සෙත් පිරිත් 44 ක්', 'නාඋයනේ අරියධම්ම මහා ස්වාමීන් වහන්සේගේ හඬින් – අන්තර්ජාලය නැතිවත්'],
    en: ['44 Paritta chants', 'Chanted by the Most Ven. Nauyane Ariyadhamma Maha Thero – works offline'] },
  { id: 'meaning', page: '/pages/09-rathana.html', play: ['09-rathana', 118],
    si: ['පදයෙන් පදය තේරුම සමඟ', 'ඇසෙන පාලි වචනය ඉස්මතු වෙයි, සිංහල තේරුම ඒ ළඟම'],
    en: ['Meaning, line by line', 'The Pali word being chanted is highlighted as you listen'] },
  { id: 'background', page: '/pages/10-karaniya.html', play: ['10-karaniya', 64], options: true,
    si: ['තිරය නිවී තිබියදීත් අසන්න', 'වේගය වෙනස් කරන්න, නින්දට පෙර නවතින ලෙස සකසන්න'],
    en: ['Keeps playing with the screen off', 'Lock screen controls, playback speed and a sleep timer'] },
  { id: 'playlists', page: '/', playlist: true,
    si: ['ඔබේම පිරිත් ලැයිස්තු', 'පිරිතක් 3, 7, 21 හෝ 108 වාරයක් නැවත නැවත අසන්න'],
    en: ['Your own playlists', 'Repeat a chant 3, 7, 21 or 108 times'] },
  { id: 'search', page: '/', search: 'bojjanga',
    si: ['පිරිතක් ඉක්මනින් සොයන්න', 'සිංහලෙන් හෝ singlish අකුරෙන්'],
    en: ['Find any chant quickly', 'Search in Sinhala, Singlish or English'] },
  { id: 'dark', page: '/pages/08-mahamangala.html', play: ['08-mahamangala', 92], dark: true,
    si: ['රාත්‍රියට අඳුරු තිරය', 'අකුරු ප්‍රමාණය ද ඔබට ගැලපෙන ලෙස'],
    en: ['Dark mode for the night', 'And the text size that suits you'] },
  { id: 'language', page: '/pages/17-dhajagga-parittam.html', play: ['17-dhajagga-parittam', 150], otherUi: true,
    si: ['ඉංග්‍රීසි තේරුම ද ඇත', 'රෝම අකුරින් පාලි පෙළ සහ English meaning'],
    en: ['Sinhala and English', 'Pali in Sinhala or Roman letters, meaning in either language'] },
]

// dist-app over http (the audio needs range requests to start in the middle)
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
  '.m4a': 'audio/mp4', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' }
const server = createServer((req, res) => {
  let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))
  if (p.endsWith('/')) p += 'index.html'
  const file = join(APP, p)
  if (!file.startsWith(APP) || !existsSync(file) || !statSync(file).isFile()) { res.writeHead(404); return res.end() }
  const size = statSync(file).size, type = TYPES[extname(file)] || 'application/octet-stream'
  const m = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '')
  if (m) {
    const start = +m[1], end = m[2] ? +m[2] : size - 1
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1, 'Accept-Ranges': 'bytes' })
    return createReadStream(file, { start, end }).pipe(res)
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' })
  createReadStream(file).pipe(res)
})
await new Promise(r => server.listen(0, '127.0.0.1', r))
const BASE = `http://127.0.0.1:${server.address().port}/`
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

let browser
async function appScreen(scene, lang, css, cssH, file) {
  const ui = scene.otherUi ? (lang === 'si' ? 'en' : 'si') : lang
  const context = await browser.createBrowserContext() // nothing saved by another scene
  const page = await context.newPage()
  await page.setViewport({ width: css, height: cssH, deviceScaleFactor: 3, isMobile: css < 600, hasTouch: css < 600 })
  const seed = { hideIntro: true, 'pirith-version': 3, darkMode: !!scene.dark }
  if (scene.playlist) {
    seed.playlists = [{ name: 'සියලු‍ පිරිත්, All Paritta', list: [] }, { name: MY_LIST.name, list: MY_LIST.list.map(([id, repeats]) => ({ pInd: pInd(id), repeats })) }]
    seed.curPlInd = 1
  }
  await page.evaluateOnNewDocument((seed) => { for (const k in seed) localStorage.setItem(k, JSON.stringify(seed[k])) }, seed)
  await page.goto(`${BASE}#${ui === 'en' ? '/en' : ''}${scene.page}`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.fonts.ready)
  if (scene.search) await page.type('input[type=search]', scene.search)
  if (scene.play) {
    await page.evaluate((p, at) => document.querySelector('#app').__vue_app__.config.globalProperties.$pinia._s.get('player').playPirith(p, at), pInd(scene.play[0]), scene.play[1])
    await page.waitForSelector('.w.on', { timeout: 20000 })
    await sleep(1500) // the page follows the line
  }
  if (scene.options) await page.evaluate(() => [...document.querySelectorAll('button[aria-pressed]')].at(-1).click())
  await sleep(700)
  await page.screenshot({ path: file })
  await context.close()
  return file
}

const CSS = `@font-face { font-family: Abhaya; src: url('${font('AbhayaUni-Bold.woff2')}'); font-weight: 700 }
  @font-face { font-family: Abhaya; src: url('${font('AbhayaUni-Regular.woff2')}'); font-weight: 400 }
  body { background: radial-gradient(ellipse at 50% 0%, #4f8060 0%, #2e4c37 45%, #14241a 100%); font-family: Abhaya, serif; position: relative }`

/** the caption band, the side margins and the corner radius of the screen (which runs off the bottom by the radius) */
const frameBox = (o) => ({ band: Math.round(o.h * 0.2), mx: Math.round(o.w * 0.07), radius: Math.round(o.w * 0.035) })

function frameHtml(o, [title, sub], img) {
  const { band, mx, radius } = frameBox(o)
  const ts = Math.round(Math.min(o.w * 0.066, o.h * 0.036)), ss = Math.round(ts * 0.5)
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}
    html, body { margin: 0; width: ${o.w}px; height: ${o.h}px; overflow: hidden }
    .caption { position: absolute; left: 0; right: 0; top: 0; height: ${band}px; display: flex; flex-direction: column; align-items: center;
      justify-content: center; text-align: center; padding: 0 ${mx}px; box-sizing: border-box }
    h1 { margin: 0; font-size: ${ts}px; font-weight: 700; color: #fbe7b4; line-height: 1.25 }
    p { margin: ${Math.round(ss * 0.6)}px 0 0; font-size: ${ss}px; color: #dcebdf; line-height: 1.4 }
    .screen { position: absolute; left: ${mx}px; top: ${band}px; width: ${o.w - 2 * mx}px; height: ${o.h - band + radius}px; object-fit: cover;
      object-position: top; border-radius: ${radius}px; box-shadow: 0 ${radius}px ${radius * 3}px rgba(0,0,0,.45) }
  </style></head><body><div class="caption"><h1>${title}</h1><p>${sub}</p></div><img class="screen" src="${pathToFileURL(img).href}"></body></html>`
}

// the Play feature graphic (1024x500)
const featureHtml = (lang) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}
    html, body { margin: 0; width: 1024px; height: 500px; overflow: hidden }
    body { display: flex; align-items: center; gap: 48px; padding: 0 64px; box-sizing: border-box; background: radial-gradient(ellipse at 25% 0%, #4f8060 0%, #2e4c37 50%, #14241a 100%) }
    img { width: 300px; height: 300px; border-radius: 50%; object-fit: cover; box-shadow: 0 10px 30px rgba(0,0,0,.45); border: 5px solid #e9c46a }
    h1 { font-weight: 700; color: #fbe7b4; font-size: 150px; margin: 0; line-height: 1.05 }
    p { color: #dcebdf; font-size: 30px; margin: 10px 0 0; line-height: 1.4 }
  </style></head><body><img src="${pathToFileURL(join(REPO, 'public/artwork/ariyadhamma-512.png')).href}"><div><h1>පිරිත්</h1>
  <p>${lang === 'si' ? 'පාලි පෙළ සහ සිංහල තේරුම සමඟ සෙත් පිරිත් 44 ක් – අන්තර්ජාලය නැතිවත්' : '44 Paritta chants with the Pali text and its meaning, word by word – offline'}</p></div></body></html>`

const args = process.argv.slice(2)
const want = args.length ? args : Object.keys(OUTPUTS)
browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required', '--mute-audio'] })
const render = async (html, w, h, file) => {
  const tmp = file.replace(/\.png$/, '.html')
  writeFileSync(tmp, html)
  const page = await browser.newPage()
  await page.setViewport({ width: w, height: h })
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: file })
  await page.close()
  unlinkSync(tmp)
}
try {
  for (const lang of ['si', 'en']) {
    for (const name of want) {
      const o = OUTPUTS[name], dir = join(OUT, lang, name), raw = join(OUT, '.raw', lang, name)
      rmSync(dir, { recursive: true, force: true })
      mkdirSync(dir, { recursive: true }); mkdirSync(raw, { recursive: true })
      const { mx, band, radius } = frameBox(o)
      const cssH = Math.round(o.css * (o.h - band + radius) / (o.w - 2 * mx)) // the screen fills the frame below the caption
      for (const [n, scene] of SCENES.entries()) {
        const img = await appScreen(scene, lang, o.css, cssH, join(raw, `${scene.id}.png`))
        await render(frameHtml(o, scene[lang], img), o.w, o.h, join(dir, `${n + 1}-${scene.id}.png`))
      }
      console.log('wrote', lang, name)
    }
    await render(featureHtml(lang), 1024, 500, join(OUT, lang, 'play-feature.png'))
  }
} finally {
  await browser.close()
  server.close()
}
