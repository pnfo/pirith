/**
 * npm run data-gen
 *
 * Reads the hand-edited sources in dev/data and writes what the site loads at runtime.
 *
 * SOURCES (N = number prefix of the pirith id, e.g. 8 for 08-mahamangala)
 *   dev/data/N-combi.txt                      "pali = sinhala" lines, groups separated by a blank line
 *   dev/data/N-trans.txt                      english, line for line with the combi file
 *   dev/data/N-combi.<speaker>.txt            optional: text as chanted by that speaker when it differs
 *   dev/data/timing/<speaker>/N-labels.txt    one "start<TAB>end" line per group (Audacity label export)
 *   dev/data/timing/<speaker>/N-words.json    optional: word times made by dev/align (see README there)
 *
 * OUTPUT
 *   public/data/text/<id>.si.json             { groups: [[[pali in sinhala script, sinhala meaning]]] }
 *   public/data/text/<id>.en.json             { groups: [[[pali in roman script, english meaning]]] }
 *   public/data/text/<id>.<speaker>.si.json   only when a speaker has its own text
 *   public/data/timing/<speaker>/<id>.json    { g: [[start,end]], w: [[[wordStart...] per row] per group] | null }
 *   src/generated/manifest.json               what exists for each pirith (used by the UI and the prerender)
 */
import fs from 'node:fs'
import path from 'node:path'
import { convert, Script } from '@pnfo/pali-converter'
import { piriths, fileNum } from '../src/catalog.js'

const dev = import.meta.dirname
const root = path.join(dev, '..')
const dataDir = path.join(dev, 'data')
const outDir = path.join(root, 'public/data')

const problems = []
const problem = (id, msg) => { problems.push(`${id}: ${msg}`) }

const read = (f) => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').replace(/\r/g, '') : null
const groupsOf = (str) => str.split(/\n\s*\n/).map(g => g.split('\n').map(l => l.trim()).filter(Boolean)).filter(g => g.length)
// the script names changed between versions of the converter (RO/SI -> LATN/SINH)
const ROMAN = Script.LATN ?? Script.RO, SINHALA = Script.SINH ?? Script.SI
const toRoman = (pali) => convert(pali, ROMAN, SINHALA).replace(/[\u200d\u200c]/g, '')
if (toRoman('බුද්ධානං') !== 'Buddhānaṃ') throw new Error(`pali-converter is not converting to roman: got "${toRoman('බුද්ධානං')}"`)
const round = (n) => Math.round(n * 1000) / 1000

function readText(id, combiFile, transFile) {
  const combi = read(combiFile)
  if (combi === null) return null
  const groups = groupsOf(combi).map(lines => lines.map(line => {
    const eq = line.indexOf('=')
    const p = (eq < 0 ? line : line.slice(0, eq)).trim()
    const s = eq < 0 ? '' : line.slice(eq + 1).trim()
    return { p, r: toRoman(p), s }
  }))

  const trans = read(transFile)
  if (trans !== null) {
    const eng = groupsOf(trans)
    if (eng.length !== groups.length) {
      problem(id, `english has ${eng.length} groups, text has ${groups.length} - english left out`)
    } else {
      groups.forEach((rows, g) => {
        if (eng[g].length !== rows.length) return problem(id, `english group ${g + 1} has ${eng[g].length} lines, text has ${rows.length}`)
        rows.forEach((row, r) => { row.e = eng[g][r] })
      })
    }
  }
  return groups
}

function readLabels(id, file) {
  const str = read(file)
  if (str === null) return null
  return str.split('\n').filter(l => l.trim()).map((line, i) => {
    const [s, e] = line.split('\t').map(Number)
    if (!(e > s) || s < 0) problem(id, `${path.basename(file)} line ${i + 1}: bad times "${line}"`)
    return [round(s), round(e)]
  })
}

/** words file: [[ [[start,end] per word] per row ] per group] - must match the text exactly */
function readWords(id, file, groups) {
  const str = read(file)
  if (str === null) return null
  const words = JSON.parse(str)
  const ok = words.length === groups.length && words.every((g, gi) =>
    g.length === groups[gi].length && g.every((row, ri) => row.length === groups[gi][ri].p.split(/\s+/).length))
  if (!ok) { problem(id, `${path.basename(file)} does not match the text - re-run dev/align; word times left out`); return null }
  return words.map(g => g.map(row => row.map(w => round(w[0]))))
}

const writeText = (name, groups) => {
  writeJson(`${outDir}/text/${name}.si.json`, { groups: groups.map(g => g.map(r => [r.p, r.s])) })
  writeJson(`${outDir}/text/${name}.en.json`, { groups: groups.map(g => g.map(r => [r.r, r.e || ''])) })
}

function writeJson(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(obj))
}

fs.rmSync(outDir, { recursive: true, force: true })
const manifest = {}

for (const p of piriths) {
  const n = fileNum(p.id)
  const entry = { groups: 0, eng: false, timing: {} }
  manifest[p.id] = entry

  const groups = readText(p.id, `${dataDir}/${n}-combi.txt`, `${dataDir}/${n}-trans.txt`)
  if (groups) {
    writeText(p.id, groups)
    entry.groups = groups.length
    entry.eng = groups.every(g => g.every(r => r.e))
    // opening lines, used for the meta description of the page
    const flat = groups.flat()
    const lead = (k) => flat.slice(1, 7).map(r => r[k]).filter(Boolean).join(' ').slice(0, 140)
    entry.intro = { p: lead('p'), e: lead('e') }
  }

  for (const [speaker] of p.rec) {
    if (!fs.existsSync(`${root}/public/audio/${speaker}/${p.id}.m4a`)) problem(p.id, `no audio for ${speaker}`)

    // a speaker can have its own arrangement of the text
    let spGroups = groups, textFile = p.id
    const own = readText(p.id, `${dataDir}/${n}-combi.${speaker}.txt`, `${dataDir}/${n}-trans.${speaker}.txt`)
    if (own) {
      spGroups = own
      textFile = `${p.id}.${speaker}`
      writeText(textFile, own)
    }
    if (!spGroups) { entry.timing[speaker] = 'none'; continue }

    const labels = readLabels(p.id, `${dataDir}/timing/${speaker}/${n}-labels.txt`)
    if (!labels) { entry.timing[speaker] = 'none'; continue }
    if (labels.length !== spGroups.length) {
      // keep the page usable: text is shown, highlighting follows the labels that exist
      problem(p.id, `${labels.length} labels but ${spGroups.length} text groups for ${speaker} - sync will be off, fix the labels`)
    }
    for (let i = 1; i < labels.length; i++) {
      if (labels[i][0] < labels[i - 1][1] - 0.5) problem(p.id, `label ${i + 1} starts before label ${i} ends`)
    }
    const words = labels.length === spGroups.length ? readWords(p.id, `${dataDir}/timing/${speaker}/${n}-words.json`, spGroups) : null
    writeJson(`${outDir}/timing/${speaker}/${p.id}.json`, { text: textFile, g: labels, w: words })
    entry.timing[speaker] = words ? 'word' : 'group'
  }
}

fs.mkdirSync(`${root}/src/generated`, { recursive: true })
fs.writeFileSync(`${root}/src/generated/manifest.json`, JSON.stringify(manifest, null, 1))

const withText = Object.values(manifest).filter(m => m.groups).length
console.log(`${piriths.length} piriths, ${withText} with text, ${Object.values(manifest).filter(m => Object.values(m.timing).includes('word')).length} with word-level sync`)
const noText = piriths.filter(p => !manifest[p.id].groups).map(p => p.id)
if (noText.length) console.log(`no text yet: ${noText.join(', ')}`)
if (problems.length) {
  console.log(`\n${problems.length} problem(s):\n  ` + problems.join('\n  '))
  if (process.argv.includes('--strict')) process.exit(1)
}
