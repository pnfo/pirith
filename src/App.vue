<template>
  <div :class="['min-h-screen flex flex-col bg-primary-light text-main dark:bg-surface-dark dark:text-main-dark transition-colors duration-300', locale === 'en' ? 'font-sans' : 'font-sinhala']">
    <!-- Header -->
    <header class="fixed top-0 w-full bg-primary text-white z-50 shadow-md h-12 flex items-center px-4 justify-between dark:bg-surface-dark-alt dark:border-b dark:border-line-dark">
      <!-- Menu Button -->
      <div class="relative z-50 flex-shrink-0">
        <button @click="toggleMenu" class="p-2 hover:bg-black/10 rounded-full transition-colors dark:hover:bg-white/10">
          <component :is="isMenuOpen ? XIcon : MenuIcon" class="w-6 h-6" />
        </button>
        
        <!-- Dropdown Menu -->
        <div v-if="isMenuOpen" 
             class="absolute top-full left-0 mt-2 w-72 bg-surface text-main shadow-xl rounded-lg overflow-hidden border border-line origin-top-left transition-all dark:bg-surface-dark-alt dark:text-main-dark dark:border-line-dark">
             <ul class="py-2">
               <!-- Language Toggle -->
               <li class="border-b border-line dark:border-line-dark">
                 <button @click="toggleLanguage" class="w-full flex items-center px-4 py-3 hover:bg-primary-light transition-colors dark:hover:bg-surface-dark font-medium text-primary dark:text-main-dark">
                   <GlobeIcon class="w-5 h-5 mr-3 text-accent dark:text-muted-dark" />
                   <span class="text-base">{{ t('app.languageOption') }}</span>
                 </button>
               </li>
               
               <li v-for="(info, ind) in menuLinks" :key="ind">
                 <a :href="info[0]" target="_blank" class="flex items-center px-4 py-3 hover:bg-primary-light transition-colors border-b border-line last:border-0 dark:hover:bg-surface-dark dark:border-line-dark" @click="closeMenu">
                   <component :is="getIcon(info[1])" class="w-5 h-5 mr-3 text-accent dark:text-muted-dark" />
                   <span class="text-base">{{ t(info[2]) }}</span>
                 </a>
               </li>
             </ul>
        </div>
      </div>

      <!-- Title -->
      <h1 id="title-bar-text" class="text-2xl flex-1 min-w-0 text-center truncate px-2 pointer-events-none select-none text-white dark:text-main-dark">
        {{ isSettings ? t('app.settings') : t('app.title') }}
      </h1>
      
      <!-- Settings/Home Button -->
      <div class="flex-shrink-0">
        <button v-if="isSettings" @click="router.push('/')" class="p-2 hover:bg-black/10 rounded-full transition-colors dark:hover:bg-white/10">
          <HomeIcon class="w-6 h-6" />
        </button>
        <button v-else @click="router.push('/settings')" class="p-2 hover:bg-black/10 rounded-full transition-colors dark:hover:bg-white/10">
          <SettingsIcon class="w-6 h-6" />
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow pt-12 px-0 pb-10 max-w-3xl mx-auto w-full">
      <router-view></router-view>
      
      <div class="text-center mt-2 px-2 mb-5 text-sm text-muted leading-relaxed dark:text-muted-dark" id="content-about">
        {{ t('app.about1') }}
        {{ t('app.about2') }}<br>
        {{ t('app.about3') }} <LaptopIcon class="inline w-3 h-3 align-baseline mx-0.5" /> <a href="https://tipitaka.lk/library/459" class="text-primary hover:underline dark:text-muted-dark">{{ t('app.aboutLink') }}</a>.<br>
        ෴෴
      </div>
    </main>
    
    <AudioTextControl v-show="store.curPirith"></AudioTextControl>

    <!-- Menu Backdrop -->
    <div v-if="isMenuOpen" class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm dark:bg-black/60" @click="closeMenu"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import AudioTextControl from '@/components/AudioTextControl.vue'
import { 
  Menu as MenuIcon, 
  X as XIcon,
  Home as HomeIcon, 
  Settings as SettingsIcon,
  Book, 
  BookOpen, 
  Library, 
  Image as ImageIcon, 
  Facebook,
  AtSign as AtSignIcon,
  Laptop as LaptopIcon,
  BookOpenText,
  Globe as GlobeIcon
} from 'lucide-vue-next'
import { useI18n } from '@/locales/index.js'

const route = useRoute()
const router = useRouter()
const store = usePlayerStore()
const { t, locale, setLocale } = useI18n()
const isMenuOpen = ref(false)

const menuLinks = [
  ['https://open.tipitaka.lk', 'book', 'app.menu.simpleTripitaka'],
  ['https://pitaka.lk/dict', 'book-outline', 'app.menu.dictionary'],
  ['https://tipitaka.lk/', 'book-open', 'app.menu.buddhaJayanthi'],
  ['https://pitaka.lk/books', 'book-open-variant', 'app.menu.bookCollection'],
  ['https://pitaka.lk/dhammapada', 'image-album', 'app.menu.dhammapada'],
  ['https://www.facebook.com/nirvana.marga/', 'face', 'app.menu.facebook'],
]

const isSettings = computed(() => route.path === '/settings')

// Watch for external dropdown changes
watch(() => store.activeDropdown, (newVal) => {
  if (newVal !== 'mainMenu' && isMenuOpen.value) {
    isMenuOpen.value = false
  }
})

function toggleLanguage() {
  setLocale(locale.value === 'si' ? 'en' : 'si')
  closeMenu()
}

function toggleMenu() {
  if (isMenuOpen.value) {
    closeMenu()
  } else {
    isMenuOpen.value = true
    store.setActiveDropdown('mainMenu')
  }
}

function closeMenu() {
  isMenuOpen.value = false
  if (store.activeDropdown === 'mainMenu') {
    store.setActiveDropdown(null)
  }
}

function getIcon(name) {
  switch(name) {
    case 'book': return Book;
    case 'book-outline': return BookOpen;
    case 'book-open': return Library; 
    case 'book-open-variant': return BookOpenText;
    case 'image-album': return ImageIcon;
    case 'face': return Facebook;
    default: return Book;
  }
}
</script>

