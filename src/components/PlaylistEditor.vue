<template>
  <div class="px-3 no-print">
    <div class="flex items-center gap-1">
      <ListMusicIcon class="w-5 h-5 text-primary dark:text-muted-dark flex-shrink-0" />
      <template v-if="renaming">
        <input ref="nameInput" v-model="name" :placeholder="t('playlist.placeholder')" maxlength="25"
          @keyup.enter="saveName" @keyup.esc="renaming = false"
          class="flex-grow min-w-0 border rounded px-2 py-1.5 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-surface-dark-alt dark:border-line-dark" />
        <button @click="saveName" :aria-label="t('home.done')" class="p-2 text-primary dark:text-main-dark"><CheckIcon class="w-5 h-5" /></button>
        <button @click="renaming = false" class="p-2 text-muted dark:text-muted-dark"><XIcon class="w-5 h-5" /></button>
      </template>
      <template v-else>
        <!-- the list opens below the box (a native select covers it on phones) -->
        <div class="relative flex-grow min-w-0">
          <button @click="toggleList" :aria-label="t('playlist.choose')" aria-haspopup="listbox" :aria-expanded="open"
            class="w-full flex items-center justify-between border border-line rounded px-2 py-1.5 bg-surface font-medium text-left focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-surface-dark-alt dark:border-line-dark">
            <span class="truncate">{{ store.curPl.name }} ({{ store.curPl.list.length }})</span>
            <ChevronDownIcon class="w-4 h-4 ml-1 flex-shrink-0 text-muted transition-transform dark:text-muted-dark" :class="{ 'rotate-180': open }" />
          </button>
          <ul v-if="open" role="listbox"
            class="absolute top-full left-0 w-full mt-1 bg-surface border border-line rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto dark:bg-surface-dark-alt dark:border-line-dark">
            <li v-for="(pl, i) in store.playlists" :key="i" role="option" :aria-selected="i === store.plInd" @click="choose(i)"
              class="flex items-center justify-between gap-2 px-4 py-3 text-lg cursor-pointer border-b border-line last:border-0 hover:bg-primary-light dark:border-line-dark dark:hover:bg-surface-dark"
              :class="{ 'bg-primary-light text-primary font-medium dark:bg-surface-dark dark:text-main-dark': i === store.plInd }">
              <span class="truncate">{{ pl.name }}</span>
              <span class="text-sm text-muted dark:text-muted-dark flex-shrink-0">{{ pl.list.length }}</span>
            </li>
          </ul>
        </div>
        <button @click="$emit('toggle-edit')" :title="t(editing ? 'home.done' : 'home.reorder')" :aria-label="t(editing ? 'home.done' : 'home.reorder')"
          class="p-2 rounded-full" :class="editing ? 'bg-primary text-white dark:bg-main-dark dark:text-surface-dark' : 'text-muted dark:text-muted-dark'">
          <component :is="editing ? CheckIcon : ArrowUpDownIcon" class="w-5 h-5" />
        </button>
        <button v-if="store.plInd > 0" @click="startRename" :title="t('playlist.rename')" :aria-label="t('playlist.rename')" class="p-2 text-muted dark:text-muted-dark"><PencilIcon class="w-5 h-5" /></button>
        <button v-if="store.plInd > 0" @click="store.deletePlaylist()" :disabled="store.curPl.list.length > 0"
          :title="t(store.curPl.list.length ? 'playlist.deleteHint' : 'playlist.delete')" :aria-label="t('playlist.delete')"
          class="p-2 text-danger disabled:text-muted disabled:opacity-40"><TrashIcon class="w-5 h-5" /></button>
        <button @click="store.addNewPlaylist(t('playlist.newPrefix'))" :title="t('playlist.add')" :aria-label="t('playlist.add')" class="p-2 text-primary dark:text-main-dark"><PlusIcon class="w-5 h-5" /></button>
      </template>
    </div>
    <div v-if="open" class="fixed inset-0 z-40" @click="closeList"></div>
    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { usePlayerStore } from '@/stores/player'
import {
  ListMusic as ListMusicIcon, Check as CheckIcon, X as XIcon, Pencil as PencilIcon,
  Trash2 as TrashIcon, Plus as PlusIcon, ArrowUpDown as ArrowUpDownIcon, ChevronDown as ChevronDownIcon,
} from 'lucide-vue-next'
import { useI18n } from '@/locales/index.js'

defineProps({ editing: Boolean })
defineEmits(['toggle-edit'])

const store = usePlayerStore()
const { t } = useI18n()
const renaming = ref(false)
const name = ref('')
const error = ref('')
const nameInput = ref(null)

// one dropdown open at a time on the page (the store knows which)
const open = computed(() => store.activeDropdown === 'playlist')
function toggleList() { store.setActiveDropdown(open.value ? null : 'playlist') }
function closeList() { if (open.value) store.setActiveDropdown(null) }
function choose(i) { store.setPlInd(i); closeList() }

function startRename() {
  name.value = store.curPl.name
  error.value = ''
  renaming.value = true
  nextTick(() => nameInput.value?.focus())
}
function saveName() {
  const v = name.value.trim()
  const taken = store.playlists.some((pl, i) => i !== store.plInd && pl.name === v)
  if (v.length < 5 || v.length > 25 || taken) { error.value = t('playlist.invalidName'); return }
  store.setPlaylistName(v)
  error.value = ''
  renaming.value = false
}
</script>
