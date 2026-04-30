<template>
  <div class="p-4 pb-0">
    <div class="flex justify-center items-center">
      <ListMusicIcon class="text-primary w-6 h-6 mr-2 dark:text-stone-400" />

      <template v-if="isEdit">
        <div class="flex-grow mx-2 max-w-[300px] relative">
            <input 
                type="text" 
                v-model="editedName" 
                class="w-full border border-line rounded px-2 py-1 text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow dark:bg-surface-dark-alt dark:border-line-dark dark:text-main-dark"
                :placeholder="t('playlist.placeholder')"
                maxlength="25"
                @keyup.enter="commitEditName"
            />
        </div>

        <button @click="commitEditName" class="p-1 text-primary hover:bg-primary-light rounded-full mr-1 transition-colors dark:text-primary dark:hover:bg-primary/30" title="Save">
            <CheckIcon class="w-5 h-5" />
        </button>
        <button @click="isEdit = false" class="p-1 text-danger hover:bg-danger-light rounded-full transition-colors dark:text-danger dark:hover:bg-danger-dark/30" title="Cancel">
            <XIcon class="w-5 h-5" />
        </button>
      </template>

      <template v-else>
        <div class="flex-grow mx-2 max-w-[300px] relative">
          <!-- Custom Dropdown Trigger (Small Control) -->
          <button 
            @click="toggleDropdown"
            class="w-full border border-line rounded px-2 py-1 text-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-left flex items-center justify-between transition-shadow dark:bg-surface-dark-alt dark:border-line-dark dark:text-main-dark"
          >
            <span class="truncate">{{ playlists[curPlInd].name }}</span>
            <ChevronDownIcon class="w-4 h-4 ml-1 flex-shrink-0 text-main dark:text-muted-dark" />
          </button>

          <!-- Custom Dropdown List (Larger Items) -->
          <div v-if="isDropdownOpen" class="absolute top-full left-0 w-full mt-1 bg-surface border-2 border-line rounded shadow-xl z-50 max-h-80 overflow-y-auto dark:bg-surface-dark dark:border-line-dark">
            <div 
              v-for="(p, i) in playlists" 
              :key="i"
              @click="selectPlaylist(i)"
              class="px-4 py-3 text-lg cursor-pointer hover:bg-primary-light transition-colors border-b border-line last:border-0 dark:border-line-dark dark:hover:bg-surface-dark-alt dark:text-main-dark"
              :class="{'bg-primary-light text-primary font-medium dark:bg-surface-dark-alt dark:text-main-dark': i === curPlInd}"
            >
              {{ p.name }}
            </div>
          </div>
        </div>

        <button @click="startEditName" class="p-1 text-muted hover:bg-surface-alt rounded-full transition-colors dark:text-muted-dark dark:hover:bg-surface-dark-alt" title="Edit Name">
          <PencilIcon class="w-5 h-5" />
        </button>
      </template>

      <button v-if="playlists[curPlInd].list.length == 0" @click="deletePlaylist" class="ml-2 p-1 text-danger hover:bg-danger-light rounded-full transition-colors dark:hover:bg-danger-dark/30 dark:text-muted-dark dark:hover:text-danger" title="Delete Playlist">
        <Trash2Icon class="w-6 h-6" />
      </button>
      <button v-else @click="addNewPlaylist" class="ml-2 p-1 text-primary hover:bg-primary-light rounded-full transition-colors dark:hover:bg-primary/30 dark:text-muted-dark dark:hover:text-primary" title="New Playlist">
        <FolderPlusIcon class="w-6 h-6" />
      </button>
    </div>

    <!-- Backdrop for dropdown -->
    <div v-if="isDropdownOpen" class="fixed inset-0 z-40" @click="closeDropdown"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { 
  ListMusic as ListMusicIcon, 
  Check as CheckIcon, 
  X as XIcon, 
  Pencil as PencilIcon, 
  Trash2 as Trash2Icon, 
  FolderPlus as FolderPlusIcon,
  ChevronDown as ChevronDownIcon
} from 'lucide-vue-next'
import { useI18n } from '@/locales/index.js'

const store = usePlayerStore()
const { t } = useI18n()

const isEdit = ref(false)
const editedName = ref('')
const isDropdownOpen = ref(false)

// Computed properties
const playlists = computed(() => store.playlists)
const curPlInd = computed({
  get: () => store.curPlInd,
  set: (val) => store.setPlInd(val)
})

// Watch activeDropdown to close if needed
watch(() => store.activeDropdown, (newVal) => {
  if (newVal !== 'playlist' && isDropdownOpen.value) {
    isDropdownOpen.value = false
  }
})

// Validation rules logic
function validateName(name) {
    if (!name) return false
    if (name.length < 5) return false
    if (name.length > 25) return false
    // Allow saving if name hasn't changed
    if (name === playlists.value[curPlInd.value].name) return true 
    if (store.playlists.some((p, i) => i !== curPlInd.value && p.name === name)) return false
    return true
}

function startEditName() {
  isEdit.value = true
  editedName.value = playlists.value[curPlInd.value].name
}

function commitEditName() {
  if (!validateName(editedName.value)) {
      alert(t('playlist.invalidName')) 
      return
  }
  isEdit.value = false
  store.setPlaylistName(editedName.value)
}

function addNewPlaylist() {
  isEdit.value = false
  store.addNewPlaylist(t('playlist.newPrefix'))
  store.setPlInd(playlists.value.length - 1)
}

function deletePlaylist() {
  isEdit.value = false
  store.deletePlaylist()
  store.setPlInd(0)
}

function toggleDropdown() {
  if (isDropdownOpen.value) {
    closeDropdown()
  } else {
    isDropdownOpen.value = true
    store.setActiveDropdown('playlist')
  }
}

function closeDropdown() {
  isDropdownOpen.value = false
  if (store.activeDropdown === 'playlist') {
    store.setActiveDropdown(null)
  }
}

function selectPlaylist(index) {
  curPlInd.value = index
  closeDropdown()
}
</script>
