<template>
  <div :class="['min-h-screen flex flex-col', locale === 'en' ? 'font-sans' : 'font-sinhala']">
    <header class="fixed top-0 inset-x-0 bg-primary text-white z-50 shadow-md h-12 flex items-center px-2 gap-1 dark:bg-surface-dark-alt dark:border-b dark:border-line-dark">
      <!-- Menu -->
      <div class="relative">
        <button @click="toggleMenu" :aria-label="t('app.menu_')" :aria-expanded="isMenuOpen"
          class="p-2 hover:bg-black/10 rounded-full transition-colors dark:hover:bg-white/10">
          <component :is="isMenuOpen ? XIcon : MenuIcon" class="w-6 h-6" />
        </button>
        <nav v-if="isMenuOpen"
          class="absolute top-full left-0 mt-2 w-72 bg-surface text-main shadow-xl rounded-lg overflow-hidden border border-line dark:bg-surface-dark-alt dark:text-main-dark dark:border-line-dark">
          <a v-for="link in menuLinks" :key="link[0]" :href="link[0]" target="_blank" rel="noopener" @click="closeMenu"
            class="flex items-center px-4 py-3 hover:bg-primary-light border-b border-line last:border-0 dark:hover:bg-surface-dark dark:border-line-dark">
            <component :is="link[1]" class="w-5 h-5 mr-3 text-primary dark:text-muted-dark" />
            <span>{{ t(link[2]) }}</span>
          </a>
        </nav>
      </div>

      <router-link :to="to('home')" class="flex-grow min-w-0 text-xl font-semibold truncate px-1">{{ t('app.title') }}</router-link>

      <router-link :to="otherLocaleRoute" :title="t('app.languageTitle')" :lang="locale === 'en' ? 'si' : 'en'"
        class="flex items-center gap-1 px-2 py-1.5 rounded-full text-sm hover:bg-black/10 dark:hover:bg-white/10"
        :class="locale === 'en' ? 'font-sinhala' : 'font-sans'">
        <GlobeIcon class="w-4 h-4" />{{ t('app.languageOption') }}
      </router-link>
      <router-link :to="to(isSettings ? 'home' : 'settings')" :aria-label="t(isSettings ? 'app.home' : 'app.settings')"
        class="p-2 hover:bg-black/10 rounded-full transition-colors dark:hover:bg-white/10">
        <component :is="isSettings ? HomeIcon : SettingsIcon" class="w-6 h-6" />
      </router-link>
    </header>

    <main class="flex-grow pt-12 w-full max-w-3xl mx-auto">
      <router-view />
    </main>

    <footer class="text-center text-xs text-muted dark:text-muted-dark py-4 px-4 max-w-3xl mx-auto" :style="{ paddingBottom: 'calc(var(--player-h) + 1rem)' }">
      {{ t('app.about1') }}<br>
      {{ t('app.about2') }}<br>
      <template v-if="!isApp">
        <span class="block mt-3">{{ t('app.about3') }}</span>
        <span class="flex flex-wrap justify-center gap-2 mt-2 font-sans no-print">
          <a href="https://play.google.com/store/apps/details?id=lk.pitaka.pirith" target="_blank" rel="noopener" class="store-link">
            <svg viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor" aria-hidden="true"><path d="M17.6 9.48l1.84-3.18a.38.38 0 0 0-.66-.38l-1.86 3.22A11.4 11.4 0 0 0 12 8.1c-1.76 0-3.42.38-4.92 1.04L5.22 5.92a.38.38 0 0 0-.66.38L6.4 9.48A10.8 10.8 0 0 0 1 18h22a10.8 10.8 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/></svg>
            Android
          </a>
          <a href="https://apps.apple.com/app/id1503645003" target="_blank" rel="noopener" class="store-link">
            <svg viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor" aria-hidden="true"><path d="M17.05 12.54c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.89 2.65 3.24 2.6 1.3-.05 1.79-.84 3.36-.84 1.57 0 2.01.84 3.38.81 1.4-.03 2.28-1.27 3.14-2.52.99-1.45 1.4-2.85 1.42-2.92-.03-.01-2.72-1.05-2.75-4.14zM14.47 4.9c.72-.87 1.2-2.08 1.07-3.28-1.03.04-2.28.69-3.02 1.55-.66.77-1.24 2-1.09 3.18 1.15.09 2.32-.58 3.04-1.45z"/></svg>
            iPhone / iPad
          </a>
        </span>
      </template>
      <span class="block mt-3">෴෴</span>
    </footer>

    <MiniPlayer v-if="store.now" />
    <div v-if="isMenuOpen" class="fixed inset-0 z-40 bg-black/20 dark:bg-black/60" @click="closeMenu"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { startSync } from '@/player/sync'
import MiniPlayer from '@/components/MiniPlayer.vue'
import {
  Menu as MenuIcon, X as XIcon, Home as HomeIcon, Settings as SettingsIcon, Globe as GlobeIcon,
  Book, BookOpen, Library, BookOpenText, Image as ImageIcon, Facebook,
} from 'lucide-vue-next'
import { useI18n } from '@/locales/index.js'

const route = useRoute()
const store = usePlayerStore()
const { t, to, locale } = useI18n()
const isMenuOpen = ref(false)
const isApp = __APP__ // inside the apps there is no point in linking to the apps

const menuLinks = [
  ['https://open.tipitaka.lk', Book, 'app.menu.simpleTripitaka'],
  ['https://pitaka.lk/dict', BookOpen, 'app.menu.dictionary'],
  ['https://tipitaka.lk/', Library, 'app.menu.buddhaJayanthi'],
  ['https://pitaka.lk/books', BookOpenText, 'app.menu.bookCollection'],
  ['https://pitaka.lk/dhammapada', ImageIcon, 'app.menu.dhammapada'],
  ['https://www.facebook.com/nirvana.marga/', Facebook, 'app.menu.facebook'],
]

const isSettings = computed(() => route.meta.page === 'settings')
const otherLocaleRoute = computed(() =>
  to(route.meta.page || 'home', route.params, locale.value === 'en' ? 'si' : 'en'))

onMounted(() => {
  store.load()
  startSync(store, locale)
})

watch(() => store.activeDropdown, (v) => { if (v !== 'mainMenu') isMenuOpen.value = false })
watch(() => route.fullPath, () => closeMenu())

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
  store.setActiveDropdown(isMenuOpen.value ? 'mainMenu' : null)
}
function closeMenu() {
  isMenuOpen.value = false
  if (store.activeDropdown === 'mainMenu') store.setActiveDropdown(null)
}
</script>

<style scoped>
.store-link { @apply inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm font-medium shadow-sm dark:bg-surface-dark-alt dark:text-main-dark dark:border dark:border-line-dark; }
</style>
