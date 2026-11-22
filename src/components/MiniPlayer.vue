<template>
  <div ref="root" class="fixed bottom-0 inset-x-0 z-40 no-print" :class="locale === 'en' ? 'font-sans' : 'font-sinhala'">
    <div class="max-w-3xl mx-auto bg-surface border-t border-x border-line shadow-[0_-4px_16px_rgba(0,0,0,0.12)] sm:rounded-t-xl dark:bg-surface-dark-alt dark:border-line-dark"
      style="padding-bottom: env(safe-area-inset-bottom)">

      <!-- what is being chanted right now (hidden on the page that already shows the full text) -->
      <div v-if="showText && rows && !onOwnPage && !store.now.idle" class="now-text px-2 pt-2 pb-1 max-h-[45vh] overflow-y-auto border-b border-line dark:border-line-dark">
        <div v-for="(row, r) in visibleRows" :key="r" class="grid grid-cols-2 gap-x-3 px-1.5 py-0.5 rounded"
          :class="row.on ? 'bg-primary/10 dark:bg-white/10' : ''">
          <span :class="row.on ? 'text-primary font-semibold dark:text-amber-200' : ''">
            <template v-if="row.on && sync.hasWords">
              <template v-for="(word, w) in row.pali.split(/\s+/)" :key="w"><span class="w" :class="{ on: w === sync.w }">{{ word }}</span>{{ ' ' }}</template>
            </template>
            <template v-else>{{ row.pali }}</template>
          </span>
          <span :class="row.on ? '' : 'text-main/80 dark:text-main-dark/80'">{{ row.mean }}</span>
        </div>
      </div>

      <!-- options -->
      <div v-if="showOptions" class="px-3 py-2 border-b border-line text-sm space-y-2 dark:border-line-dark">
        <div class="flex items-center gap-1.5 flex-wrap">
          <GaugeIcon class="w-4 h-4 text-muted dark:text-muted-dark" /><span class="mr-1">{{ t('player.speed') }}</span>
          <button v-for="r in rates" :key="r" @click="store.setRate(r)" class="chip" :class="{ 'chip-on': store.rate === r }">{{ r }}×</button>
        </div>
        <div class="flex items-center gap-1.5 flex-wrap">
          <MoonIcon class="w-4 h-4 text-muted dark:text-muted-dark" /><span class="mr-1">{{ t('player.sleep') }}</span>
          <button @click="store.setSleep(0)" class="chip" :class="{ 'chip-on': !store.sleepAt }">{{ t('player.sleepOff') }}</button>
          <button v-for="m in sleepOptions" :key="m" @click="store.setSleep(m)" class="chip" :class="{ 'chip-on': sleepChoice === m }">{{ m }} {{ t('player.minutes') }}</button>
          <span v-if="sleepLeft" class="text-muted dark:text-muted-dark font-mono text-xs">{{ sleepLeft }}</span>
        </div>
      </div>

      <!-- seek bar -->
      <div class="flex items-center gap-2 px-3 pt-2 text-xs font-mono text-muted dark:text-muted-dark">
        <span class="w-10 text-right">{{ fmt(position) }}</span>
        <input type="range" min="0" :max="Math.max(duration, 1)" step="0.5" :value="position" :aria-label="title"
          @input="onDrag" @change="onSeek" class="flex-grow accent-primary h-1.5 dark:accent-amber-200" />
        <span class="w-10">{{ fmt(duration) }}</span>
      </div>

      <!-- controls -->
      <div class="flex items-center px-1 pb-1.5">
        <button @click="store.previous()" :aria-label="t('player.previous')" class="p-2 text-main dark:text-main-dark"><SkipBackIcon class="w-5 h-5" /></button>
        <button @click="store.toggle()" :aria-label="t(store.playing ? 'player.pause' : 'player.play')"
          class="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow dark:bg-main-dark dark:text-surface-dark">
          <component :is="store.playing ? PauseIcon : PlayIcon" class="w-6 h-6" :class="store.playing ? '' : 'ml-0.5'" />
        </button>
        <button @click="store.next()" :aria-label="t('player.next')" class="p-2 text-main dark:text-main-dark"><SkipForwardIcon class="w-5 h-5" /></button>

        <router-link :to="to('pirith', { id: p.id })" class="flex-grow min-w-0 px-1.5 leading-tight" :title="t('player.openPage')">
          <span class="block truncate font-semibold text-primary dark:text-main-dark">{{ title }}</span>
          <span class="block truncate text-xs text-muted dark:text-muted-dark">
            <template v-if="store.now.repeats > 1">{{ t('player.round', { n: store.now.rep, of: store.now.repeats }) }} · </template>{{ line }}
          </span>
        </router-link>

        <button v-if="rows && !onOwnPage && !store.now.idle" @click="showText = !showText" :aria-label="t(showText ? 'player.hideText' : 'player.showText')" :aria-pressed="showText"
          class="p-2" :class="showText ? 'text-primary dark:text-amber-200' : 'text-muted dark:text-muted-dark'"><TextIcon class="w-5 h-5" /></button>
        <button @click="showOptions = !showOptions" :aria-label="t('player.options')" :aria-pressed="showOptions"
          class="p-2 relative" :class="showOptions ? 'text-primary dark:text-amber-200' : 'text-muted dark:text-muted-dark'">
          <SlidersIcon class="w-5 h-5" />
          <span v-if="store.sleepAt || store.rate !== 1" class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { piriths, titleOf, recordingOf, durationSecs } from '@/catalog'
import { engine } from '@/player/engine'
import { sync, currentRows } from '@/player/sync'
import {
  Play as PlayIcon, Pause as PauseIcon, SkipBack as SkipBackIcon, SkipForward as SkipForwardIcon,
  Text as TextIcon, SlidersHorizontal as SlidersIcon, Gauge as GaugeIcon, Moon as MoonIcon,
} from 'lucide-vue-next'
import { useI18n } from '@/locales/index.js'

const store = usePlayerStore()
const route = useRoute()
const { t, to, locale } = useI18n()

const rates = [0.75, 1, 1.25, 1.5]
const sleepOptions = [15, 30, 60]
const showText = ref(true)
const showOptions = ref(false)
const root = ref(null)

const p = computed(() => piriths[store.now.pInd])
const title = computed(() => titleOf(p.value, locale.value))
const onOwnPage = computed(() => route.meta.page === 'pirith' && route.params.id === p.value.id)
const duration = computed(() => store.duration || durationSecs(recordingOf(p.value, store.speaker).dur))

// lines of the group being chanted; long groups show a window around the current line
const rows = computed(() => currentRows(locale.value))
const visibleRows = computed(() => {
  const all = rows.value.map((row, r) => ({ pali: row[0], mean: row[1], on: r === sync.r }))
  if (all.length <= 8) return all
  const from = Math.max(0, Math.min(sync.r - 3, all.length - 8))
  return all.slice(from, from + 8)
})
const line = computed(() => {
  const row = store.now.idle ? null : rows.value?.[sync.r]
  return row ? row[0] : recordingOf(p.value, store.speaker).dur
})

// position: a light timer is enough for the bar (the text highlight has its own frame loop)
const position = ref(0)
let dragging = false, timer = 0
const tick = () => { if (!dragging) position.value = store.now?.idle ? 0 : engine.position() }
function onDrag(e) { dragging = true; position.value = Number(e.target.value) }
function onSeek(e) { dragging = false; store.seek(Number(e.target.value)) }
const fmt = (s) => { s = Math.max(0, Math.floor(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }

// sleep timer display
const clock = ref(Date.now())
const sleepLeft = computed(() => (store.sleepAt > clock.value ? fmt((store.sleepAt - clock.value) / 1000) : ''))
const sleepChoice = ref(0)
watch(() => store.sleepAt, (v, old) => { if (!v) sleepChoice.value = 0; else if (v !== old) sleepChoice.value = Math.round((v - Date.now()) / 60000) })

// the page keeps clear of the player bar
let resizeObs = null
const setHeight = () => document.documentElement.style.setProperty('--player-h', (root.value?.offsetHeight || 0) + 'px')

onMounted(() => {
  timer = setInterval(() => { tick(); clock.value = Date.now() }, 500)
  tick()
  setHeight()
  if (window.ResizeObserver) { resizeObs = new ResizeObserver(setHeight); resizeObs.observe(root.value) }
})
onBeforeUnmount(() => {
  clearInterval(timer)
  resizeObs?.disconnect()
  document.documentElement.style.setProperty('--player-h', '0px')
})
</script>

<style scoped>
.chip { @apply px-2.5 py-1 rounded-full border border-line dark:border-line-dark; }
.chip-on { @apply bg-primary text-white border-primary dark:bg-main-dark dark:text-surface-dark dark:border-main-dark; }
</style>
