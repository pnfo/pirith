<template>
  <div class="min-h-screen flex flex-col font-sinhala bg-primary-light text-main dark:bg-surface-dark dark:text-main-dark transition-colors duration-300">
    <!-- Header -->
    <header class="fixed top-0 w-full bg-primary text-white z-50 shadow-md h-12 flex items-center px-4 justify-between dark:bg-surface-dark-alt dark:border-b dark:border-line-dark">
      <!-- Menu Button -->
      <div class="relative z-50">
        <button @click="toggleMenu" class="p-2 hover:bg-black/10 rounded-full transition-colors dark:hover:bg-white/10">
          <component :is="isMenuOpen ? XIcon : MenuIcon" class="w-6 h-6" />
        </button>
        
        <!-- Dropdown Menu -->
        <div v-if="isMenuOpen" 
             class="absolute top-full left-0 mt-2 w-72 bg-surface text-main shadow-xl rounded-lg overflow-hidden border border-line origin-top-left transition-all dark:bg-surface-dark-alt dark:text-main-dark dark:border-line-dark">
             <ul class="py-2">
               <li v-for="(info, ind) in menuLinks" :key="ind">
                 <a :href="info[0]" target="_blank" class="flex items-center px-4 py-3 hover:bg-primary-light transition-colors border-b border-line last:border-0 dark:hover:bg-surface-dark dark:border-line-dark" @click="closeMenu">
                   <component :is="getIcon(info[1])" class="w-5 h-5 mr-3 text-accent dark:text-muted-dark" />
                   <span class="text-base">{{ info[2] }}</span>
                 </a>
               </li>
             </ul>
        </div>
      </div>

      <!-- Title -->
      <h1 id="title-bar-text" class="text-3xl font-styled absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none select-none text-white dark:text-main-dark">
        {{ isSettings ? 'සැකසුම්' : 'සෙත් පිරිත්' }}
      </h1>
      
      <!-- Settings/Home Button -->
      <div>
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
        මේ‍ ව්‍යායාමය නාඋයනේ අරියධම්ම හිමියන්ගේ ශ්‍රී නාමයට කෙරෙන උපහාරයක්ම වේවා. පාලි පෙළ සහ සිංහල පරිවර්තනය උපුටා ගැනීම පිරුවානා පොත් වහන්සේගෙනි. 
        උපකාර කල සියලුදෙනාට ද පින් අයත් වේවා. යම් දෝෂයක් ගැන අපව දැනුවත් කිරීමට pathnirvana<AtSignIcon class="inline w-3 h-3 align-baseline mx-0.5" />gmail.com.<br>
        මේ පිරිත් ඇතුලත් කර සැකසු අන්තර්ජාලය අනවශ්‍ය offline මෘදුකාංග <LaptopIcon class="inline w-3 h-3 align-baseline mx-0.5" /> <a href="https://tipitaka.lk/library/459" class="text-primary hover:underline dark:text-muted-dark">පරිඝනක සඳහා</a> ලබාගන්න.<br>
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
  BookOpenText
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = usePlayerStore()
const isMenuOpen = ref(false)

const menuLinks = [
  ['https://open.tipitaka.lk', 'book', 'සරල ත්‍රිපිටකය'],
  ['https://pitaka.lk/dict', 'book-outline', 'පාළි-සිංහල ශබ්දකෝෂය'],
  ['https://tipitaka.lk/', 'book-open', 'බුද්ධ ජයන්ති ත්‍රිපිටකය'],
  ['https://pitaka.lk/books', 'book-open-variant', 'බෞද්ධ පොත් සංචිතය'],
  ['https://pitaka.lk/dhammapada', 'image-album', 'ධම්මපද කතා වස්තු'],
  ['https://www.facebook.com/nirvana.marga/', 'face', 'Facebook පිටුව'],
]

const isSettings = computed(() => route.path === '/settings')

// Watch for external dropdown changes
watch(() => store.activeDropdown, (newVal) => {
  if (newVal !== 'mainMenu' && isMenuOpen.value) {
    isMenuOpen.value = false
  }
})

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

<style scoped>
/* Ensure the font is applied */
#title-bar-text { font-family: 'styled', serif; }
</style>
