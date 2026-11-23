<template>
  <div class="pb-3">
    <div v-if="!store.hideIntro" class="relative mx-3 mt-4 p-3 pr-10 rounded-lg bg-surface border border-line dark:bg-surface-dark-alt dark:border-line-dark">
      <h1 class="text-xl font-semibold text-primary dark:text-main-dark leading-snug">{{ t('home.heading') }}</h1>
      <p class="text-muted dark:text-muted-dark mt-1">{{ t('home.intro') }}</p>
      <!-- the site in a phone's browser: the app plays offline and with the screen locked -->
      <p v-if="storeLink" class="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3 pt-3 border-t border-line dark:border-line-dark no-print">
        <span class="flex-1 min-w-[12rem] text-sm">{{ t('home.appHint') }}</span>
        <a :href="storeLink" target="_blank" rel="noopener"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-sm font-medium shadow-sm whitespace-nowrap dark:bg-main-dark dark:text-surface-dark">
          <SmartphoneIcon class="w-4 h-4" />{{ t('home.appOpen') }}
        </a>
      </p>
      <button @click="store.dismissIntro()" :aria-label="t('home.dismiss')" :title="t('home.dismiss')"
        class="absolute top-1.5 right-1.5 p-1.5 rounded-full text-muted hover:bg-black/5 dark:text-muted-dark dark:hover:bg-white/10 no-print"><XIcon class="w-5 h-5" /></button>
    </div>
    <h1 v-else class="sr-only">{{ t('home.heading') }}</h1>

    <!-- search + categories -->
    <div class="px-3 mt-3 no-print">
      <div class="relative">
        <SearchIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-muted-dark" />
        <input v-model="query" type="search" :placeholder="t('home.search')" :aria-label="t('home.search')"
          class="w-full pl-10 pr-3 py-2.5 rounded-full border border-line bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-surface-dark-alt dark:border-line-dark" />
      </div>
      <div class="flex gap-2 mt-3 overflow-x-auto pb-1">
        <button v-for="c in catChips" :key="c.key" @click="cat = c.key"
          class="px-3 py-1 rounded-full text-sm whitespace-nowrap border transition-colors"
          :class="cat === c.key ? 'bg-primary text-white border-primary dark:bg-main-dark dark:text-surface-dark dark:border-main-dark' : 'bg-surface border-line text-main dark:bg-surface-dark-alt dark:border-line-dark dark:text-main-dark'">
          {{ c.label }}
        </button>
      </div>
    </div>

    <PlaylistEditor class="mt-3" :editing="editing" @toggle-edit="editing = !editing" />

    <ol class="mt-2 px-2 space-y-1">
      <li v-for="row in rows" :key="row.item.pInd"
        class="flex items-center rounded-lg border shadow-sm"
        :class="isNow(row.item.pInd) ? 'bg-surface border-primary/40 ring-1 ring-primary/20 dark:bg-surface-dark-alt dark:border-muted-dark' : 'bg-surface border-line dark:bg-surface-dark-alt/60 dark:border-line-dark'">

        <button @click="store.togglePirith(row.item.pInd)" :aria-label="t(isPlaying(row.item.pInd) ? 'home.pause' : 'home.play') + ': ' + row.title"
          class="m-1.5 w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-colors"
          :class="isNow(row.item.pInd) ? 'bg-primary text-white dark:bg-main-dark dark:text-surface-dark' : 'bg-primary-light text-primary dark:bg-surface-dark dark:text-main-dark'">
          <component :is="isPlaying(row.item.pInd) ? PauseIcon : PlayIcon" class="w-5 h-5" :class="isPlaying(row.item.pInd) ? '' : 'ml-0.5'" />
        </button>

        <router-link :to="to('pirith', { id: row.p.id })" class="flex-grow min-w-0 py-2 pr-1">
          <span class="block text-lg leading-tight truncate" :class="isNow(row.item.pInd) ? 'text-primary font-semibold dark:text-main-dark' : ''">{{ row.title }}</span>
          <span class="block text-sm text-muted dark:text-muted-dark truncate">{{ row.sub }}</span>
        </router-link>

        <span v-if="row.item.repeats > 1" class="text-xs font-bold text-primary bg-primary-light rounded-full px-1.5 py-0.5 mr-1 dark:bg-surface-dark dark:text-main-dark">×{{ row.item.repeats }}</span>
        <span class="text-xs text-muted dark:text-muted-dark font-mono mr-1">{{ row.dur }}</span>

        <template v-if="editing">
          <button @click="store.moveInPlaylist(row.lInd, -1)" :disabled="row.lInd === 0" :aria-label="t('home.moveUp')" class="p-2 disabled:opacity-30"><ChevronUpIcon class="w-5 h-5" /></button>
          <button @click="store.moveInPlaylist(row.lInd, 1)" :disabled="row.lInd === store.curPl.list.length - 1" :aria-label="t('home.moveDown')" class="p-2 disabled:opacity-30"><ChevronDownIcon class="w-5 h-5" /></button>
        </template>

        <div v-else class="relative no-print">
          <button @click.stop="toggleMenu(row.item.pInd)" :aria-label="t('home.more')" class="p-2 rounded-full text-muted hover:bg-black/5 dark:text-muted-dark dark:hover:bg-white/10">
            <MoreIcon class="w-5 h-5" />
          </button>
          <div v-if="openMenu === row.item.pInd" class="absolute right-0 top-full mt-1 w-60 bg-surface rounded-lg shadow-xl border border-line z-30 overflow-hidden dark:bg-surface-dark-alt dark:border-line-dark">
            <div class="px-3 pt-2 text-xs font-bold text-muted dark:text-muted-dark">{{ t('home.repeats') }}</div>
            <div class="flex flex-wrap gap-1.5 px-3 py-2 border-b border-line dark:border-line-dark">
              <button v-for="n in store.repeatCounts" :key="n" @click="setRepeats(row.lInd, n)"
                class="min-w-[2.5rem] px-2 py-1 rounded-full text-sm border"
                :class="row.item.repeats === n ? 'bg-primary text-white border-primary dark:bg-main-dark dark:text-surface-dark' : 'border-line dark:border-line-dark'">{{ n }}</button>
            </div>
            <template v-if="store.plInd === 0">
              <div class="px-3 pt-2 text-xs font-bold text-muted dark:text-muted-dark">{{ t('home.addToPlaylist') }}</div>
              <button v-for="(pl, plInd) in otherPlaylists" :key="plInd" @click="addTo(plInd + 1, row.item.pInd)"
                class="w-full text-left px-3 py-2 hover:bg-primary-light flex items-center dark:hover:bg-surface-dark">
                <ListPlusIcon class="w-4 h-4 mr-2 text-muted dark:text-muted-dark" /><span class="truncate">{{ pl.name }}</span>
              </button>
            </template>
            <button v-else @click="removeFrom(row.lInd)" class="w-full text-left px-3 py-2 text-danger hover:bg-danger-light flex items-center dark:hover:bg-surface-dark">
              <TrashIcon class="w-4 h-4 mr-2" />{{ t('home.remove') }}
            </button>
          </div>
        </div>
      </li>
    </ol>

    <p v-if="!rows.length" class="text-center text-muted dark:text-muted-dark py-8 px-4">
      {{ store.curPl.list.length ? t('home.noResults') : t('home.emptyPlaylist') }}
    </p>
    <div v-if="toast" class="fixed left-1/2 -translate-x-1/2 z-50 bg-main text-white text-sm px-4 py-2 rounded-full shadow-lg" :style="{ bottom: 'calc(var(--player-h) + 1rem)' }">{{ toast }}</div>
    <div v-if="openMenu !== null" class="fixed inset-0 z-20" @click="closeMenu"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { piriths, categories, recordingOf, titleOf } from '@/catalog'
import PlaylistEditor from '@/components/PlaylistEditor.vue'
import { Smartphone as SmartphoneIcon,
  Play as PlayIcon, Pause as PauseIcon, Search as SearchIcon, X as XIcon, MoreVertical as MoreIcon,
  ListPlus as ListPlusIcon, Trash2 as TrashIcon, ChevronUp as ChevronUpIcon, ChevronDown as ChevronDownIcon,
} from 'lucide-vue-next'
import { useI18n } from '@/locales/index.js'

const store = usePlayerStore()
const { t, to, locale } = useI18n()

const query = ref('')
const cat = ref('all')
const editing = ref(false)
const openMenu = ref(null)

// set after mount, so the prerendered page and the first client render agree
const storeLink = ref('')
onMounted(() => {
  if (__APP__) return
  const ua = navigator.userAgent
  if (/Android/i.test(ua)) storeLink.value = 'https://play.google.com/store/apps/details?id=lk.pitaka.pirith'
  else if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) storeLink.value = 'https://apps.apple.com/app/id1503645003'
})
const toast = ref('')

const catChips = computed(() => [
  { key: 'all', label: t('home.all') },
  ...Object.entries(categories).map(([key, c]) => ({ key, label: c[locale.value] })),
])

// everything a person might type: sinhala, pali in roman letters (with or without dots), singlish, english
const plain = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[‍‌]/g, '')
const haystack = piriths.map(p => plain([p.si, p.pop, p.roman, p.en, ...p.sg, p.id].join(' | ')))

const rows = computed(() => {
  const q = plain(query.value.trim())
  return store.curPl.list
    .map((item, lInd) => ({ item, lInd, p: piriths[item.pInd] }))
    .filter(({ item, p }) => (cat.value === 'all' || p.cat === cat.value) && (!q || haystack[item.pInd].includes(q)))
    .map(row => ({
      ...row,
      title: titleOf(row.p, locale.value),
      sub: locale.value === 'en' ? row.p.en : (row.p.pop !== row.p.si ? `${row.p.pop} · ${row.p.sg[0]}` : row.p.sg[0]),
      dur: recordingOf(row.p, store.speaker).dur,
    }))
})
const otherPlaylists = computed(() => store.playlists.slice(1))

const isNow = (pInd) => store.now?.pInd === pInd
const isPlaying = (pInd) => isNow(pInd) && store.playing

// reordering only makes sense on the whole list
watch(editing, (on) => { if (on) { query.value = ''; cat.value = 'all' } })
watch(() => store.plInd, () => { editing.value = false })

function toggleMenu(pInd) {
  openMenu.value = openMenu.value === pInd ? null : pInd
  store.setActiveDropdown(openMenu.value === null ? null : 'rowMenu')
}
function closeMenu() { openMenu.value = null }
watch(() => store.activeDropdown, (v) => { if (v !== 'rowMenu') closeMenu() })

function setRepeats(lInd, nr) { store.changeRepeats({ lInd, nr }); closeMenu() }
function removeFrom(lInd) { store.deleteFromPlaylist({ plInd: store.plInd, lInd }); closeMenu() }
function addTo(plInd, pInd) {
  const ok = store.addToPlaylist({ plInd, pInd })
  closeMenu()
  toast.value = `${t(ok ? 'home.added' : 'home.alreadyIn')}: ${store.playlists[plInd].name}`
  setTimeout(() => { toast.value = '' }, 2000)
}
</script>
