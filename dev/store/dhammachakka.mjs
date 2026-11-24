// The album artwork of the chants shown under the speaker "pitaka" (catalog.js): a Dhammacakka with 24 spokes
// in the colours of the app icon. Writes public/artwork/pitaka-{128,256,512}.png (rendered with Chrome):
//   node dev/store/dhammachakka.mjs
import puppeteer from 'puppeteer-core'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url)), OUT = join(here, '../../public/artwork')
const SPOKES = 24, C = 256, GOLD = '#f6c453', PALE = '#f6dc9a', DARK = '#c98a2b'
const at = (r, deg) => { const a = (deg - 90) * Math.PI / 180; return `${(C + r * Math.cos(a)).toFixed(2)},${(C + r * Math.sin(a)).toFixed(2)}` }
// a spoke widens from the hub to the rim; a small knob sits outside the rim at the end of each
const spokes = Array.from({ length: SPOKES }, (_, i) => { const d = i * 360 / SPOKES
  return `<polygon points="${at(40, d - 3.2)} ${at(40, d + 3.2)} ${at(172, d + 1.5)} ${at(172, d - 1.5)}" fill="${PALE}"/><circle cx="${at(214, d).split(',')[0]}" cy="${at(214, d).split(',')[1]}" r="7.5" fill="${GOLD}"/>` }).join('\n')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#143a3a"/><stop offset="1" stop-color="#0b1f24"/></linearGradient></defs>
<rect width="512" height="512" fill="url(#g)"/>
<circle cx="${C}" cy="${C}" r="150" fill="${GOLD}" fill-opacity=".08"/>
${spokes}
<circle cx="${C}" cy="${C}" r="186" fill="none" stroke="${GOLD}" stroke-width="22"/>
<circle cx="${C}" cy="${C}" r="168" fill="none" stroke="${DARK}" stroke-width="5"/>
<circle cx="${C}" cy="${C}" r="44" fill="${GOLD}"/><circle cx="${C}" cy="${C}" r="30" fill="none" stroke="${DARK}" stroke-width="5"/><circle cx="${C}" cy="${C}" r="13" fill="#143a3a"/>
</svg>`
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const page = await browser.newPage()
for (const size of [128, 256, 512]) {
  await page.setViewport({ width: size, height: size })
  await page.setContent(`<body style="margin:0">${svg.replace('width="512" height="512"', `width="${size}" height="${size}"`)}</body>`)
  await page.screenshot({ path: join(OUT, `pitaka-${size}.png`) })
}
await browser.close()
console.log('wrote public/artwork/pitaka-{128,256,512}.png')
