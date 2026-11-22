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
        <select :value="store.plInd" @change="store.setPlInd(Number($event.target.value))" :aria-label="t('playlist.choose')"
          class="flex-grow min-w-0 border border-line rounded px-2 py-1.5 bg-surface font-medium focus:outline-none dark:bg-surface-dark-alt dark:border-line-dark">
          <option v-for="(pl, i) in store.playlists" :key="i" :value="i">{{ pl.name }} ({{ pl.list.length }})</option>
        </select>
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
    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { usePlayerStore } from '@/stores/player'
import {
  ListMusic as ListMusicIcon, Check as CheckIcon, X as XIcon, Pencil as PencilIcon,
  Trash2 as TrashIcon, Plus as PlusIcon, ArrowUpDown as ArrowUpDownIcon,
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
