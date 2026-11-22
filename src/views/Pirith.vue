<template>
  <article v-if="p" class="px-3 pt-4 pb-4">
    <nav class="text-sm no-print">
      <router-link :to="to('home')" class="text-primary dark:text-muted-dark inline-flex items-center"><ChevronLeftIcon class="w-4 h-4" />{{ t('pirith.allPiriths') }}</router-link>
    </nav>

    <h1 class="text-2xl font-semibold text-primary dark:text-main-dark mt-2 leading-snug">{{ title }}</h1>
    <p class="text-muted dark:text-muted-dark font-sans text-sm mt-0.5">
      <template v-if="locale === 'en'">{{ p.en }} · {{ p.sg[0] }}</template>
      <template v-else><span v-if="p.pop !== p.si" class="font-sinhala text-base">{{ p.pop }} · </span>{{ p.sg[0] }} · {{ p.roman }}</template>
    </p>

    <!-- listen -->
    <div class="flex items-center gap-3 mt-3 no-print">
      <button @click="store.togglePirith(p.pInd)"
        class="flex items-center gap-2 pl-4 pr-5 py-2.5 rounded-full bg-primary text-white font-semibold shadow hover:opacity-90 dark:bg-main-dark dark:text-surface-dark">
        <component :is="isPlaying ? PauseIcon : PlayIcon" class="w-5 h-5" />{{ t(isPlaying ? 'pirith.pause' : 'pirith.listen') }}
      </button>
      <div class="text-sm leading-tight min-w-0">
        <div class="truncate">{{ t('pirith.by') }}: {{ speaker[locale] }}</div>
        <div class="text-muted dark:text-muted-dark font-mono text-xs">{{ rec.dur }}</div>
      </div>
    </div>

    <!-- tools -->
    <div class="flex flex-wrap items-center gap-1.5 mt-3 text-sm no-print">
      <template v-if="groups">
        <button @click="store.stepFontSize(-1)" :aria-label="t('pirith.smaller')" :title="t('pirith.smaller')" class="tool"><AArrowDownIcon class="w-5 h-5" /></button>
        <button @click="store.stepFontSize(1)" :aria-label="t('pirith.larger')" :title="t('pirith.larger')" class="tool"><AArrowUpIcon class="w-5 h-5" /></button>
        <button @click="store.toggleMeaning()" :aria-pressed="store.showMeaning" class="tool" :class="{ 'tool-on': store.showMeaning }"><LanguagesIcon class="w-4 h-4 mr-1" />{{ t('pirith.meaning') }}</button>
        <button @click="store.toggleAutoScroll()" :aria-pressed="store.autoScroll" class="tool" :class="{ 'tool-on': store.autoScroll }"><ScrollTextIcon class="w-4 h-4 mr-1" />{{ t('pirith.autoScroll') }}</button>
        <button v-if="!isApp" @click="print" class="tool"><PrinterIcon class="w-4 h-4 mr-1" />{{ t('pirith.print') }}</button>
      </template>
      <a v-if="!isApp" :href="audioUrl" :download="p.id + '.m4a'" class="tool"><DownloadIcon class="w-4 h-4 mr-1" />{{ t('pirith.download') }}</a>
      <button @click="share" class="tool"><Share2Icon class="w-4 h-4 mr-1" />{{ copied ? t('pirith.copied') : t('pirith.share') }}</button>
    </div>

    <!-- text -->
    <section v-if="groups" class="mt-4">
      <h2 class="text-base font-semibold text-muted dark:text-muted-dark no-print">{{ title }} – {{ t('pirith.textHeading') }}</h2>
      <p class="text-xs text-muted dark:text-muted-dark no-print">{{ t('pirith.tapHint') }}</p>
      <div ref="reader" :key="textName + locale" class="reader mt-2" :class="{ 'no-meaning': !store.showMeaning, 'can-seek': isNow }" @click="onTap">
        <div v-for="(rows, g) in groups" :key="g" class="grp" :data-g="g">
          <div v-for="(row, r) in rows" :key="r" class="row" :data-r="r">
            <span class="pali" :lang="locale === 'en' ? 'pi-Latn' : 'pi-Sinh'">{{ row[0] }}</span><span class="mean">{{ row[1] }}</span>
          </div>
        </div>
      </div>
      <p class="print-only text-xs mt-4">{{ canonical }}</p>
    </section>
    <p v-else class="mt-6 p-4 rounded-lg bg-surface border border-line text-muted dark:bg-surface-dark-alt dark:border-line-dark dark:text-muted-dark">{{ t('pirith.noText') }}</p>

    <!-- onward links -->
    <nav class="mt-6 grid grid-cols-2 gap-2 text-sm no-print">
      <router-link v-if="prev" :to="to('pirith', { id: prev.id })" class="nav-card">
        <span class="text-xs text-muted dark:text-muted-dark flex items-center"><ChevronLeftIcon class="w-3 h-3" />{{ t('pirith.previous') }}</span>
        <span class="block truncate text-base">{{ titleOf(prev, locale) }}</span>
      </router-link><span v-else></span>
      <router-link v-if="next" :to="to('pirith', { id: next.id })" class="nav-card text-right">
        <span class="text-xs text-muted dark:text-muted-dark flex items-center justify-end">{{ t('pirith.next') }}<ChevronRightIcon class="w-3 h-3" /></span>
        <span class="block truncate text-base">{{ titleOf(next, locale) }}</span>
      </router-link>
    </nav>
    <nav v-if="related.length" class="mt-4 no-print">
      <h2 class="text-sm font-semibold text-muted dark:text-muted-dark">{{ t('pirith.related') }}</h2>
      <div class="flex flex-wrap gap-1.5 mt-1.5">
        <router-link v-for="x in related" :key="x.id" :to="to('pirith', { id: x.id })"
          class="px-3 py-1 rounded-full bg-surface border border-line text-sm dark:bg-surface-dark-alt dark:border-line-dark">{{ titleOf(x, locale) }}</router-link>
      </div>
    </nav>
  </article>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, onServerPrefetch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { piriths, pirithById, speakers, recordingOf, titleOf } from '@/catalog'
import { getText, loadText, textKey, assetUrl } from '@/data'
import { sync, timeOf } from '@/player/sync'
import { SITE, pathFor } from '@/seo'
import {
  Play as PlayIcon, Pause as PauseIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
  AArrowDown as AArrowDownIcon, AArrowUp as AArrowUpIcon, Languages as LanguagesIcon, ScrollText as ScrollTextIcon,
  Printer as PrinterIcon, Download as DownloadIcon, Share2 as Share2Icon,
} from 'lucide-vue-next'
import { useI18n } from '@/locales/index.js'

const props = defineProps({ id: String })
const isApp = __APP__ // printing and file downloads are not available inside the app's web view
const store = usePlayerStore()
const router = useRouter()
const { t, to, locale } = useI18n()

const p = computed(() => pirithById[props.id])
if (!p.value && !import.meta.env.SSR) router.replace(to('home'))

const title = computed(() => titleOf(p.value, locale.value))
const rec = computed(() => recordingOf(p.value, store.speaker))
const speaker = computed(() => speakers[rec.value.speaker])
const audioUrl = computed(() => assetUrl(rec.value.audio))
const canonical = computed(() => SITE + pathFor('pirith', locale.value, props.id))

// the text shown is the one the playing recording follows (a speaker may chant another arrangement)
const textName = computed(() => (sync.id === props.id && sync.textName) || props.id)
const groups = computed(() => getText(textKey(textName.value, locale.value)))
const ensureText = () => loadText(textName.value, locale.value)
watch([textName, locale], ensureText)
onServerPrefetch(ensureText)

const isNow = computed(() => !!store.now && !store.now.idle && store.now.pInd === p.value?.pInd)
const isPlaying = computed(() => isNow.value && store.playing)

const prev = computed(() => piriths[p.value.pInd - 1])
const next = computed(() => piriths[p.value.pInd + 1])
const related = computed(() => piriths.filter(x => x.cat === p.value.cat && x.id !== p.value.id).slice(0, 12))

// ---------- highlight what is being chanted (done on the DOM directly: long suttas have 1500+ lines) ----------
const reader = ref(null)
let onGrp = null, onRow = null, onWord = null, wordsOf = null, pausedUntil = 0

function restoreWords() {
  if (wordsOf) { wordsOf.el.textContent = wordsOf.text; wordsOf = null }
  onWord = null
}
function paint() {
  const root = reader.value
  if (!root) return
  const active = sync.ready && sync.id === props.id && isNow.value
  const grp = active && sync.g >= 0 ? root.children[sync.g] : null
  const row = grp && sync.r >= 0 ? grp.children[sync.r] : null

  if (grp !== onGrp) {
    onGrp?.classList.remove('on')
    grp?.classList.add('on')
    onGrp = grp
    if (grp && store.autoScroll && Date.now() > pausedUntil) grp.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }
  if (row !== onRow) {
    onRow?.classList.remove('on')
    restoreWords()
    row?.classList.add('on')
    onRow = row
  }
  if (row && sync.hasWords && sync.w >= 0) {
    if (!wordsOf) { // split the line being chanted into words, put it back when the line is done
      const el = row.firstElementChild, text = el.textContent
      wordsOf = { el, text }
      el.textContent = ''
      text.split(/(\s+)/).forEach(part => {
        if (!part.trim()) return el.appendChild(document.createTextNode(part))
        const span = document.createElement('span')
        span.className = 'w'
        span.textContent = part
        el.appendChild(span)
      })
    }
    const word = wordsOf.el.querySelectorAll('.w')[sync.w] || null
    if (word !== onWord) { onWord?.classList.remove('on'); word?.classList.add('on'); onWord = word }
  }
}
watch(() => [sync.ready, sync.id, sync.g, sync.r, sync.w, isNow.value], paint, { flush: 'post' })
watch(groups, () => { onGrp = onRow = null; restoreWords(); nextTick(paint) })

// reading ahead by hand pauses the automatic scrolling for a while
const userScrolled = () => { pausedUntil = Date.now() + 6000 }
onMounted(() => {
  ensureText()
  window.addEventListener('wheel', userScrolled, { passive: true })
  window.addEventListener('touchmove', userScrolled, { passive: true })
  paint()
})
onBeforeUnmount(() => {
  window.removeEventListener('wheel', userScrolled)
  window.removeEventListener('touchmove', userScrolled)
})

/** tap a line to hear it - only while this pirith is in the player, so reading never starts audio by accident */
function onTap(evt) {
  if (!isNow.value || !sync.ready || window.getSelection()?.toString()) return
  const row = evt.target.closest('.row'), grp = evt.target.closest('.grp')
  if (!grp) return
  const time = timeOf(Number(grp.dataset.g), row ? Number(row.dataset.r) : 0)
  if (time === null) return
  pausedUntil = 0
  store.seek(time)
  if (!store.playing) store.toggle()
}

function print() { window.print() }

const copied = ref(false)
async function share() {
  const data = { title: document.title, url: __APP__ ? canonical.value : location.href.split('#')[0] }
  try {
    if (navigator.share) return await navigator.share(data)
    await navigator.clipboard.writeText(data.url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (e) { /* cancelled */ }
}
</script>

<style scoped>
.tool { @apply inline-flex items-center px-2.5 py-1.5 rounded-full bg-surface border border-line text-main dark:bg-surface-dark-alt dark:border-line-dark dark:text-main-dark; }
.tool-on { @apply border-primary text-primary bg-primary-light dark:border-main-dark dark:bg-surface-dark dark:text-main-dark; }
.nav-card { @apply block p-3 rounded-lg bg-surface border border-line dark:bg-surface-dark-alt dark:border-line-dark; }
</style>
