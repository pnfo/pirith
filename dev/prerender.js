/**
 * Last step of `npm run build`: turns the single page app in dist/ into one real
 * HTML file per page, so search engines and slow phones get the full text at once.
 *
 *   dist/index.html, dist/en/index.html
 *   dist/pages/<id>.html, dist/en/pages/<id>.html     (same URLs the old static pages had)
 *   dist/settings/index.html, dist/en/settings/index.html
 *   dist/sitemap.xml
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.join(import.meta.dirname, '..')
const dist = path.join(root, 'dist')
const { render, allPaths, SITE } = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')))

let template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

// the sinhala font is needed for the first paint: fetch it alongside the css
const fonts = fs.readdirSync(path.join(dist, 'assets')).filter(f => f.endsWith('.woff2'))
const font = fonts.find(f => f.includes('Regular')) || fonts[0]
const base = template.match(/(?:src|href)="([^"]*?)assets\//)[1]
const preload = font ? `<link rel="preload" href="${base}assets/${font}" as="font" type="font/woff2" crossorigin>` : ''

const readText = (id, locale) => {
  const file = path.join(root, `public/data/text/${id}.${locale}.json`)
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')).groups : null
}

const urls = []
let bytes = 0
for (const url of allPaths()) {
  const { html, head, lang, state } = await render(url, readText)
  const page = template
    .replace('<html lang="si">', `<html lang="${lang}">`)
    .replace(/<!--head-start-->[\s\S]*<!--head-end-->/, () => head + (lang === 'si' ? '\n    ' + preload : ''))
    .replace('<div id="app"><!--app--></div>', () => `<div id="app" data-ssr>${html}</div>`)
    .replace('<!--state-->', () => state ? `<script>window.__PIRITH_TEXT__=${JSON.stringify(state).replace(/</g, '\\u003c')}</script>` : '')

  const file = path.join(dist, url.endsWith('/') ? url + 'index.html' : url)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, page)
  bytes += page.length
  if (!url.includes('/settings/')) urls.push(url.slice(1))
}

// sitemap with the sinhala/english pairs
const alt = (u) => {
  const si = u.replace(/^en\//, ''), en = 'en/' + si
  return `<xhtml:link rel="alternate" hreflang="si" href="${SITE}${si}"/><xhtml:link rel="alternate" hreflang="en" href="${SITE}${en}"/>`
}
fs.writeFileSync(path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  urls.map(u => `<url><loc>${SITE}${u}</loc>${alt(u)}</url>`).join('\n') + '\n</urlset>\n')

fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true })
console.log(`prerendered ${allPaths().length} pages (${(bytes / 1e6).toFixed(1)} MB of html), sitemap with ${urls.length} urls`)
