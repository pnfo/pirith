/**
 * Everything search engines and link previews see: one place, used by the
 * build-time prerender (full <head>) and by the browser (title + lang on navigation).
 *
 * Titles deliberately carry the Sinhala name AND the "Singlish" spelling: most of
 * our search traffic types things like "dasa disa piritha" or "pattana suthraya".
 */
import { piriths, pirithById, speakers, recordingOf, durationSecs } from './catalog'
import manifest from './generated/manifest.json'

export const SITE = 'https://pitaka.lk/pirith/' // public address of the web build

const prefix = (locale) => (locale === 'en' ? 'en/' : '')
export const pathFor = (page, locale, id) =>
  prefix(locale) + (page === 'pirith' ? `pages/${id}.html` : page === 'settings' ? 'settings/' : '')

/** every page of the site, as router paths - the prerender walks this list */
export function allPaths() {
  const out = []
  for (const locale of ['si', 'en']) {
    out.push('/' + pathFor('home', locale))
    out.push('/' + pathFor('settings', locale))
    for (const p of piriths) out.push('/' + pathFor('pirith', locale, p.id))
  }
  return out
}

const clip = (str, max) => {
  str = str.replace(/\s+/g, ' ').trim()
  if (str.length <= max) return str
  return str.slice(0, str.lastIndexOf(' ', max - 1)) + '…'
}
const iso8601 = (dur) => { const s = durationSecs(dur); return `PT${Math.floor(s / 60)}M${s % 60}S` }

export function headFor(route) {
  const locale = route.meta?.locale || 'si'
  const page = route.meta?.page || 'home'
  const id = route.params?.id
  const en = locale === 'en'
  const url = (l) => SITE + pathFor(page, l, id)

  const head = {
    lang: en ? 'en' : 'si',
    canonical: url(locale),
    alternates: { si: url('si'), en: url('en') },
    image: SITE + 'artwork/logo-800.png',
    type: 'website',
    robots: page === 'settings' ? 'noindex,follow' : 'index,follow',
    jsonld: [],
  }

  const p = page === 'pirith' ? pirithById[id] : null
  if (p) {
    const rec = recordingOf(p)
    const who = speakers[rec.speaker]
    const intro = manifest[p.id]?.intro
    const sg = p.sg[0]
    if (en) {
      head.title = `${p.roman} (${sg}) – Pali text, English meaning & audio`
      head.description = clip(`${p.roman} – ${p.en}. Read the full Pali text with ${intro ? 'line by line English meaning' : 'audio'} and listen to the chanting by ${who.en}. ${intro?.e || ''}`, 230)
    } else {
      head.title = `${p.pop} - ${sg} | පාලි පෙළ, සිංහල තේරුම සහ හඬ`
      head.description = clip(`${p.pop} (${p.si}) ${intro ? 'සම්පූර්ණ පාලි පෙළ සිංහල තේරුම සමඟ කියවන්න.' : ''} ${who.si}ගේ සජ්ඣායනය අසන්න. ${sg} lyrics, meaning, audio. ${intro?.p || ''}`, 230)
    }
    head.type = 'article'
    head.jsonld.push({
      '@context': 'https://schema.org',
      '@type': 'AudioObject',
      name: en ? `${p.roman} – ${p.en}` : `${p.pop} (${sg})`,
      alternateName: [p.si, p.pop, p.roman, ...p.sg],
      description: head.description,
      contentUrl: SITE + rec.audio,
      encodingFormat: 'audio/mp4',
      duration: iso8601(rec.dur),
      inLanguage: 'pi',
      url: head.canonical,
      creator: { '@type': 'Person', name: who.en },
    }, {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: en ? 'Pirith' : 'පිරිත්', item: SITE + prefix(locale) },
        { '@type': 'ListItem', position: 2, name: en ? p.roman : p.pop, item: head.canonical },
      ],
    })
  } else if (page === 'settings') {
    head.title = en ? 'Settings | Pirith' : 'සැකසුම් | පිරිත්'
    head.description = ''
  } else {
    if (en) {
      head.title = 'Pirith – Paritta chanting with Pali text, English meaning & audio'
      head.description = `Listen to ${piriths.length} Buddhist paritta (pirith) chants by Nauyane Ariyadhamma Thero and follow the Pali text line by line with English meaning: Maha Mangala, Ratana, Karaniya Metta, Jinapanjara, Samantha Pattana and more.`
    } else {
      head.title = 'පිරිත් - සෙත් පිරිත් පාලි පෙළ සහ සිංහල තේරුම සමඟ | Pirith Sinhala'
      head.description = `සෙත් පිරිත් ${piriths.length}ක් නාඋයනේ අරියධම්ම හිමියන්ගේ හඬින් අසන්න, පාලි පෙළ සහ සිංහල තේරුම පේළියෙන් පේළිය කියවන්න. මහා මංගල, රතන, කරණීය මෙත්ත, ජිනපඤ්ජර, සමන්ත පට්ඨාන ඇතුළු සියලුම පිරිත් - pirith potha, lyrics, meaning.`
    }
    head.jsonld.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: en ? 'Paritta chants' : 'සෙත් පිරිත්',
      itemListElement: piriths.map((x, i) => ({
        '@type': 'ListItem', position: i + 1, name: en ? x.roman : x.pop, url: SITE + pathFor('pirith', locale, x.id),
      })),
    })
  }
  return head
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

export function renderHead(h) {
  const tags = [
    `<title>${esc(h.title)}</title>`,
    h.description && `<meta name="description" content="${esc(h.description)}">`,
    `<meta name="robots" content="${h.robots}">`,
    `<link rel="canonical" href="${h.canonical}">`,
    `<link rel="alternate" hreflang="si" href="${h.alternates.si}">`,
    `<link rel="alternate" hreflang="en" href="${h.alternates.en}">`,
    `<link rel="alternate" hreflang="x-default" href="${h.alternates.si}">`,
    `<meta property="og:type" content="${h.type}">`,
    `<meta property="og:site_name" content="pitaka.lk">`,
    `<meta property="og:title" content="${esc(h.title)}">`,
    h.description && `<meta property="og:description" content="${esc(h.description)}">`,
    `<meta property="og:url" content="${h.canonical}">`,
    `<meta property="og:locale" content="${h.lang === 'en' ? 'en_US' : 'si_LK'}">`,
    `<meta property="og:image" content="${h.image}">`,
    `<meta property="og:image:width" content="800">`,
    `<meta property="og:image:height" content="800">`,
    `<meta name="twitter:card" content="summary">`,
    ...h.jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`),
  ]
  return tags.filter(Boolean).join('\n    ')
}

/** browser side: keep title and language right while moving between pages */
export function applyHead(route) {
  const h = headFor(route)
  document.title = h.title
  document.documentElement.lang = h.lang
  document.querySelector('meta[name="description"]')?.setAttribute('content', h.description)
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', h.canonical)
}
