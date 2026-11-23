// Renders dev/store/logo.html into every icon the apps and stores need, and puts them in place:
//   node dev/store/logo.mjs
//   ios/Pirith/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png, Android/app/src/main/res/mipmap-*/ic_launcher*.png,
//   dev/store/build/icon-512.png (the Play listing: ICON=dev/store/build/icon-512.png node dev/store/play-listing.mjs)
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import puppeteer from 'puppeteer-core'

const here = dirname(fileURLToPath(import.meta.url)), REPO = join(here, '../..')
const RES = join(REPO, 'Android/app/src/main/res')
const DPI = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 }
const jobs = [['full', 1024, join(REPO, 'ios/Pirith/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png')], ['full', 512, join(here, 'build/icon-512.png')]]
for (const [d, k] of Object.entries(DPI)) jobs.push(['full', 48 * k, join(RES, `mipmap-${d}/ic_launcher.png`)], ['round', 48 * k, join(RES, `mipmap-${d}/ic_launcher_round.png`)],
  ['fg', 108 * k, join(RES, `mipmap-${d}/ic_launcher_foreground.png`)])

mkdirSync(join(here, 'build'), { recursive: true })
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--allow-file-access-from-files'] })
for (const [mode, size, file] of jobs) {
  const page = await browser.newPage()
  await page.setViewport({ width: size, height: size })
  await page.goto(`${pathToFileURL(join(here, 'logo.html')).href}?mode=${mode}`)
  await page.waitForFunction(() => document.title === 'ready')
  await page.screenshot({ path: file, omitBackground: mode !== 'full' }) // the App Store icon has no transparency
  await page.close()
  console.log(mode, size, file.replace(REPO + '/', ''))
}
await browser.close()
