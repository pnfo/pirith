<template>
  <div class="fixed bottom-0 left-0 w-full z-50 flex flex-col items-center pointer-events-none">
      <!-- Content Container -->
      <div v-if="curText.length && showText" class="w-full max-w-[800px] bg-surface shadow-2xl border-t border-line pointer-events-auto relative rounded-t-lg overflow-hidden dark:bg-surface-dark dark:border-line-dark">
        
        <!-- Text Table -->
        <div class="overflow-y-auto max-h-[60vh]">
          <table class="w-full table-fixed border-collapse">
            <tbody class="text-rows">
              <tr v-for="(row, ri) in curTextSubset" :key="ri" 
                  class="border-b border-line last:border-0 transition-colors duration-300 dark:border-line-dark"
                  :class="{ 'bg-primary-light dark:bg-surface-dark-alt': row.oi == curTextIndex }">
                <td class="w-1/2 px-2 py-1 text-right text-lg break-words font-sinhala leading-relaxed dark:text-main-dark">{{ row.pali }}</td>
                <td class="w-1/2 px-2 py-1 text-left text-lg font-sinhala leading-relaxed text-primary dark:text-muted-dark" v-if="row.sinh" :rowspan="row.span">{{ row.sinh }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Controls overlay on text -->
        <button class="absolute bottom-0 right-4 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-opacity-90 transition-all z-10 dark:hover:bg-surface-dark" @click="showText = false">
          <EyeOffIcon class="w-5 h-5" />
        </button>

        <button v-if="curRepeats > 1" class="absolute bottom-0 left-4 p-2 bg-muted text-white rounded-full shadow-lg hover:bg-opacity-90 transition-all z-10 dark:hover:bg-surface-dark">
          <RepeatIcon class="w-5 h-5" />
        </button>
      </div>
      
      <!-- Show Text Button (Floating) -->
      <div v-if="!showText && curPirith" class="pointer-events-auto w-full max-w-[800px] relative">
          <button class="absolute bottom-0 right-4 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-opacity-90 transition-all z-10 dark:bg-surface-dark-alt dark:hover:bg-surface-dark" @click="showText = true">
            <EyeIcon class="w-5 h-5" />
          </button>
      </div>

      <!-- Progress Bar & Audio Player -->
      <div class="w-full max-w-[800px] pointer-events-auto bg-surface shadow-top dark:bg-surface-dark">
          <!-- Repeat Progress -->
          <div v-if="curRepeats > 1" class="w-full bg-line h-6 relative dark:bg-surface-dark-alt">
             <div class="h-full bg-primary transition-all duration-500 dark:bg-surface-dark" :style="{ width: (curCount /curRepeats * 100) + '%' }"></div>
             <div class="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md shadow-black dark:text-main-dark">
               {{ curCount + '/' + curRepeats }}
             </div>
          </div>
          
          <audio ref="audio" controls class="w-full h-12 outline-none dark:bg-surface-dark-alt" :src="playingSrc"></audio>
      </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted, nextTick } from 'vue'
  import { pirithList, setupMediaSession } from '@/pirith-list.js'
  import { pirithData } from '@/pirith-data.js'
  import { usePlayerStore } from '@/stores/player'
  import { Eye as EyeIcon, EyeOff as EyeOffIcon, Repeat as RepeatIcon } from 'lucide-vue-next'

  const store = usePlayerStore()
  const audio = ref(null)

  const showText = ref(true)
  const curText = ref([])
  const elapsedRatio = ref(0)
  const isCounting = ref(false)
  const curCount = ref(1)

  // Computed
  const curPirith = computed({
    get: () => store.curPirith,
    set: (val) => store.setCurPirith(val)
  })
  
  const curPl = computed(() => store.curPl)
  
  const curTextIndex = computed(() => {
    const total = curText.value.reduce((acc, row) => acc + row.pali.length, 0);
    const elapsedTotal = total * elapsedRatio.value;
    for (let i = 0, sum = 0; i < curText.value.length; i++) {
        sum = sum + curText.value[i].pali.length;
        if (sum >= elapsedTotal) return i;
    }
    return curText.value.length - 1;
  })

  const curTextSubset = computed(() => {
    let startInd = 0
    let endInd = curText.value.length
    if (curText.value.length > 10) {
      startInd = Math.max(0, curTextIndex.value - 5)
      endInd = Math.min(curText.value.length, curTextIndex.value + 4)
    }
    return curText.value.slice(startInd, endInd).map((row, i) => { return {...row, oi: startInd + i} })
  })

  const playingInfo = computed(() => curPirith.value ? pirithList[curPirith.value - 1] : [])
  const playingSrc = computed(() => playingInfo.value[0] ? `./audio/${playingInfo.value[0]}.mp3` : '')
  const lInd = computed(() => curPl.value.list.findIndex(e => e.pInd == (curPirith.value - 1)))
  const curRepeats = computed(() => lInd.value < 0 ? 0 : curPl.value.list[lInd.value].repeats)

  // Watchers
  watch(curPirith, () => {
    curCount.value = 1
    updatePirith()
  })

  // Methods
  function incrementMetrics(pInd) {
    store.incrementMetrics(pInd)
  }

  function updatePirith() {
    curText.value = []
    const titleEl = document.getElementById('title-bar-text')
    if (titleEl) titleEl.innerText = playingInfo.value[2] || 'සෙත් පිරිත්'
    
    if (!curPirith.value) return

    nextTick(() => {
      const pInd = curPirith.value - 1
      if (audio.value) {
          audio.value.play().then(() => { setupMediaSession(pInd, audio.value) }).catch(e => console.error("Play error:", e));
      }
      isCounting.value = true
      console.log(`${playingInfo.value[0]} playing.`)
    })
  }

  function getNextPirithToPlay() {
    if (curRepeats.value > 1 && curCount.value <= curRepeats.value) return curPirith.value
    if (lInd.value + 1 >= curPl.value.list.length) return 0
    curCount.value = 1
    return pirithList[curPl.value.list[lInd.value + 1].pInd][1] + 1
  }

  function pirithPaused() {
    console.log('pirith paused')
    if (audio.value && Math.abs(audio.value.currentTime - audio.value.duration) > 0.01) {
      isCounting.value = false
    }
  }

  function pirithEnded() {
    if (isCounting.value) {
      incrementMetrics(curPirith.value - 1)
      isCounting.value = false
    }
    // Increment before checking if we should play again
    curCount.value++
    
    store.setCurPirith(getNextPirithToPlay())
    updatePirith()
  }

  function timeUpdated() {
      if (!curPirith.value || !playingInfo.value[0] || !audio.value) return;
      
      const data = pirithData[playingInfo.value[0]]
      if (!data) return;

      const currentTime = audio.value.currentTime;
      let i = -1;
      // Note: data.labels might need checking if it exists
      if (data.labels) {
          for (; i+1 < data.labels.length && currentTime > data.labels[i+1][0]; i++);
      }
      
      if (i < 0) return; // or handle logic if no labels

      if (data.labels && data.text) {
          const curLabel = data.labels[i]
          curText.value = data.text[i];
          if (curLabel) {
             elapsedRatio.value = Math.min(1, (currentTime - curLabel[0]) / (curLabel[1] - curLabel[0]) );
          }
      }
  }

  function updateMediaPosition() {
      if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession && audio.value && !isNaN(audio.value.duration)) {
          navigator.mediaSession.setPositionState({
              duration: audio.value.duration,
              playbackRate: audio.value.playbackRate || 1,
              position: audio.value.currentTime
          });
      }

      // Update Native Android Media Notification
      if (window.Android && typeof window.Android.updateMediaState === 'function' && playingInfo.value && audio.value) {
          const title = playingInfo.value[2] || 'සෙත් පිරිත්';
          const artist = "නාඋයනේ අරියධම්ම ථෙරෝ";
          window.Android.updateMediaState(title, artist, !audio.value.paused);
      }
  }

  onMounted(() => {
    // Expose to Android for lock-screen controls
    window.vueMediaControl = (action) => {
        if (!audio.value) return;
        if (action === 'play') audio.value.play();
        if (action === 'pause') audio.value.pause();
    };

    // We attach listeners to the document for global control, or to the audio element.
    // The original code attached to document with capture=true.
    // Ideally we should attach to the audio element, but let's keep original logic for safety
    // if there were reasons (like other players). But here the audio element is in this component.
    // Let's attach to audio element ref in onMounted if possible, but the original code used document...
    // The original code:
    // document.addEventListener('pause', this.pirithPaused, true)
    // ...
    // This captures ALL pause events on the page.
    
    // For Vue 3 ref:
    if (audio.value) {
        audio.value.addEventListener('pause', pirithPaused)
        audio.value.addEventListener('ended', pirithEnded)
        audio.value.addEventListener('timeupdate', timeUpdated)

        audio.value.addEventListener('playing', updateMediaPosition)
        audio.value.addEventListener('pause', updateMediaPosition)
        audio.value.addEventListener('seeked', updateMediaPosition)
        audio.value.addEventListener('ratechange', updateMediaPosition)
        audio.value.addEventListener('durationchange', updateMediaPosition)
    }
  })
</script>

<style scoped>
.shadow-top {
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
