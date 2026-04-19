<template>
  <div class="home pb-3"> <!-- Padding for bottom player -->
    <PlaylistEditor />

    <div class="mt-4 px-2">
      <draggable 
        v-model="curPlList" 
        handle=".drag-handle" 
        item-key="pInd"
        @end="dragEnded"
        class="space-y-1"
      >
        <template #item="{ element: item, index: lInd }">
          <div 
             class="flex items-center py-1 px-2 rounded-lg transition-all border shadow-sm"
             :class="[
               curPirith === item.pInd + 1 ? 'bg-primary-light border-primary/30 ring-1 ring-primary/20 dark:bg-surface-dark-alt dark:border-line-dark dark:ring-line-dark' : 'bg-surface border-line hover:shadow-md dark:bg-surface-dark dark:border-line-dark'
             ]"
          >
            <!-- Main Click Area -->
            <div class="flex-grow flex items-center min-w-0 cursor-pointer select-none" @click="playPausePirith(item.pInd + 1)">
              <span class="mr-3 font-mono text-muted w-6 text-right text-sm dark:text-muted-dark">{{ lInd + 1 }}.</span>
              <span class="mr-2 flex-grow truncate font-medium text-lg text-main font-sinhala leading-tight dark:text-main-dark"
                :class="curPirith === item.pInd + 1 ? 'text-primary dark:text-main-dark' : ''"
              >{{ pirithList[item.pInd][2] }}</span>
              <a 
                :href="`pages/${pirithList[item.pInd][0]}.html`"
                @click.stop
                class="hidden sm:block text-xs text-muted hover:text-primary hover:underline mr-2 whitespace-nowrap transition-colors dark:text-muted-dark dark:hover:text-primary"
              >
                ({{ pirithList[item.pInd][4] }})
              </a>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center space-x-1">
              
              <!-- Repeat Menu -->
              <div class="relative">
                <button 
                  @click.stop="toggleRepeatMenu(lInd)"
                  class="p-2 rounded-full hover:bg-black/5 transition-colors relative dark:hover:bg-white/10"
                  :class="item.repeats > 1 ? 'text-primary bg-primary-light dark:bg-surface-dark-alt dark:text-main-dark' : 'text-muted dark:text-muted-dark'"
                >
                  <RepeatIcon class="w-5 h-5" />
                  <span v-if="item.repeats > 1" class="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm dark:bg-surface-dark-alt">
                    {{ item.repeats }}
                  </span>
                </button>
                
                <!-- Repeat Dropdown -->
                <div v-if="activeRepeatMenu === lInd" class="absolute right-0 top-full mt-2 w-48 bg-surface rounded-lg shadow-xl border border-line z-30 py-1 overflow-hidden dark:bg-surface-dark dark:border-line-dark">
                   <div class="px-4 py-2 text-xs font-bold text-muted uppercase tracking-wider bg-surface-alt border-b border-line dark:bg-surface-dark-alt dark:border-line-dark dark:text-muted-dark">Repeats</div>
                   <button 
                     v-for="n in store.repeatCounts" 
                     :key="n"
                     @click="setRepeats(lInd, n)"
                     class="w-full text-left px-4 py-2 hover:bg-primary-light flex items-center justify-between group transition-colors dark:text-main-dark dark:hover:bg-surface-dark-alt"
                     :class="{'text-primary font-medium bg-primary-light/50 dark:bg-surface-dark-alt dark:text-main-dark': item.repeats === n}"
                   >
                     <span>{{ n }}</span>
                     <CheckIcon v-if="item.repeats === n" class="w-4 h-4 text-primary dark:text-muted-dark" />
                   </button>
                </div>
                <!-- Backdrop for repeat menu -->
                <div v-if="activeRepeatMenu === lInd" class="fixed inset-0 z-20" @click="activeRepeatMenu = null"></div>
              </div>

              <!-- Playlist Add/Remove Menu -->
              <div class="relative">
                <template v-if="curPlInd === 0">
                   <button 
                     @click.stop="toggleAddMenu(lInd)"
                     class="p-2 rounded-full text-muted hover:text-main hover:bg-black/5 transition-colors dark:text-muted-dark dark:hover:text-main-dark dark:hover:bg-white/10"
                     :class="{'opacity-50 cursor-not-allowed': store.playlists.length <= 1}"
                     :disabled="store.playlists.length <= 1"
                   >
                     <ListPlusIcon class="w-5 h-5" />
                   </button>
                   
                   <!-- Add Dropdown -->
                   <div v-if="activeAddMenu === lInd" class="absolute right-0 top-full mt-2 w-64 bg-surface rounded-lg shadow-xl border border-line z-30 py-1 overflow-hidden dark:bg-surface-dark dark:border-line-dark">
                      <div class="px-4 py-2 text-xs font-bold text-muted uppercase tracking-wider bg-surface-alt border-b border-line dark:bg-surface-dark-alt dark:border-line-dark dark:text-muted-dark">Add to Playlist</div>
                      <button 
                        v-for="(pl, plIdx) in store.playlists" 
                        :key="plIdx"
                        v-show="plIdx > 0" 
                        @click="toggleInPlaylist(plIdx, item.pInd)"
                        class="w-full text-left px-4 py-3 hover:bg-surface-alt flex items-center justify-between transition-colors border-b border-line last:border-0 dark:text-main-dark dark:hover:bg-surface-dark-alt dark:border-line-dark"
                      >
                        <span class="truncate pr-2 text-sm">{{ pl.name }}</span>
                        <CheckIcon v-if="isInPlaylist(plIdx, item.pInd)" class="w-4 h-4 text-primary flex-shrink-0 dark:text-muted-dark" />
                      </button>
                   </div>
                   <!-- Backdrop -->
                   <div v-if="activeAddMenu === lInd" class="fixed inset-0 z-20" @click="activeAddMenu = null"></div>
                </template>
                
                <button v-else 
                  @click.stop="store.deleteFromPlaylist({plInd: curPlInd, lInd})"
                  class="p-2 rounded-full text-muted hover:text-danger hover:bg-danger-light transition-colors dark:text-muted-dark dark:hover:text-danger dark:hover:bg-danger-dark/20"
                >
                  <Trash2Icon class="w-5 h-5" />
                </button>
              </div>

              <!-- Drag Handle -->
              <div class="drag-handle cursor-move p-2 text-muted hover:text-main hover:bg-black/5 rounded-full touch-none transition-colors dark:text-muted-dark dark:hover:text-main-dark dark:hover:bg-white/10">
                <GripHorizontalIcon class="w-5 h-5" />
              </div>

            </div>
          </div>
        </template>
      </draggable>
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import PlaylistEditor from '@/components/PlaylistEditor.vue'
import { pirithList } from '@/pirith-list.js'
import { pirithData } from '@/pirith-data.js'
import { usePlayerStore } from '@/stores/player'
import { Repeat as RepeatIcon, Check as CheckIcon, ListPlus as ListPlusIcon, Trash2 as Trash2Icon, GripHorizontal as GripHorizontalIcon } from 'lucide-vue-next'

const store = usePlayerStore()

// State for active menus (stores index of the item whose menu is open)
const activeRepeatMenu = ref(null)
const activeAddMenu = ref(null)

// Computed
const curPirith = computed(() => store.curPirith)
const curPlInd = computed(() => store.curPlInd)

const curPlList = computed({
  get: () => store.curPl.list.map(item => ({...item})), // cloning to avoid direct mutation issues with draggable
  set: (newList) => store.reorderPl(newList)
})

// Methods
function playPausePirith(key) {
  store.setCurPirith(store.curPirith == key ? 0 : key)
}

function getStaticPageHref(pInd) {
  const name = pirithList[pInd][0]
  return pirithData[name] ? `./pages/${name}.html` : ''
}

function dragEnded(e) {
  console.log(`dragged from ${e.oldIndex} to ${e.newIndex}`)
}

function toggleRepeatMenu(index) {
  activeRepeatMenu.value = activeRepeatMenu.value === index ? null : index
  activeAddMenu.value = null
}

function setRepeats(lInd, n) {
  store.changeRepeats({lInd, nr: n})
  activeRepeatMenu.value = null
}

function toggleAddMenu(index) {
  activeAddMenu.value = activeAddMenu.value === index ? null : index
  activeRepeatMenu.value = null
}

function isInPlaylist(plInd, pInd) {
  return store.playlists[plInd].list.findIndex(e => e.pInd == pInd) != -1
}

function toggleInPlaylist(plInd, pInd) {
  if (isInPlaylist(plInd, pInd)) {
    const lInd = store.playlists[plInd].list.findIndex(e => e.pInd == pInd)
    store.deleteFromPlaylist({plInd, lInd})
  } else {
    store.addToPlaylist({plInd, pInd})
  }
}

</script>

<style scoped>
/* Scoped styles mostly replaced by Tailwind */
</style>
