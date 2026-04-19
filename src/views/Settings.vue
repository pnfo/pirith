<template>
  <div class="p-4 space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

      <!-- Dark Mode -->
      <div class="bg-surface dark:bg-surface-dark-alt rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-2 dark:text-main-dark" v-if="!store.darkMode">රාත්‍රී අඳුරු තිරය</h3>
        <h3 class="text-lg font-semibold mb-2 dark:text-main-dark" v-else>දහවල් ආලෝකමත් තිරය</h3>
        <p class="text-sm text-muted dark:text-muted-dark mb-4">රාත්‍රී අඳුරු තිරය සහ දහවල් ආලෝකමත් තිරය අතර මාරු වෙන්න. අඳුරු තිරය රාත්‍රියේදී ඇසට පහසුය.</p>
        <button 
          @click="store.toggleDarkMode()" 
          class="flex items-center px-4 py-2 border rounded text-primary border-primary hover:bg-primary hover:text-white transition-colors dark:text-main-dark dark:border-line-dark dark:hover:bg-surface-dark"
        >
          <SunIcon v-if="store.darkMode" class="mr-2 w-5 h-5" />
          <MoonIcon v-else class="mr-2 w-5 h-5" />
          {{ store.darkMode ? 'ආලෝකමත් තිරය' : 'අඳුරු තිරය' }}
        </button>
      </div>

      <!-- Repeat Counts -->
      <div class="bg-surface dark:bg-surface-dark-alt rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-2 dark:text-main-dark">නැවත වාදනය කළ හැකි වාර ගණන්</h3>
        <p class="text-sm text-muted dark:text-muted-dark mb-4">එකම පිරිත නැවත නැවත වාදනය කළ හැකි වාර ගණන් පහතින් ඇතුළු කරන්න. ඒ ඒ ගණන හිස්තැනකින් (space) වෙන් කරන්න.</p>
        <div class="flex items-center">
          <div class="p-2 bg-primary-light text-primary rounded-full mr-3">
             <RepeatIcon class="w-5 h-5" />
          </div>
          <input 
            type="text" 
            v-model="repeatCountsText"
            class="flex-grow border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-surface-dark dark:text-main-dark dark:border-line-dark"
            placeholder="1 3 7 21 108"
          />
        </div>
      </div>

      <!-- Play Metrics -->
      <div class="bg-surface dark:bg-surface-dark-alt rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-2 dark:text-main-dark">ඔබ විසින් පිරිත් අසන ලද වාර ගණන්</h3>
        <p class="text-sm text-muted dark:text-muted-dark mb-4">
          එක් එක් පිරිත ඔබ විසින් ඇසූ වාරගණන් පහතින් දිස්වනු ඇත. පිරිත මුල සිට අගට නොකඩවා අසන ලද වාරයන් පමණක් මෙහිදී ගණනය කරනු ලැබේ. 
          එක් වරක් හෝ ඔබ ඇසූ පිරිත් පමණක් මෙහි දක්වනු ලැබේ.
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm dark:text-main-dark">
            <thead>
              <tr class="border-b dark:border-line-dark">
                <th class="py-2 px-2">පිරිතේ නම</th>
                <th class="py-2 px-2">ඇසූ වාර</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(metric, i) in metrics" :key="i" class="border-b dark:border-line-dark last:border-0">
                <td class="py-2 px-2">{{ metric.name }}</td>
                <td class="py-2 px-2 text-primary font-medium">{{ metric.count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

       <!-- Pronoun Changes -->
       <div class="bg-surface dark:bg-surface-dark-alt rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-2 dark:text-main-dark">පිරිත් තමන්ටම කියන ආකාරය</h3>
        <p class="text-sm text-muted dark:text-muted-dark mb-4">
          මේ පිරිත් ස්වාමින්වහන්සේ විසින් සජ්ඣායනා කරන්නේ ඔබට සෙත් පිණිසය. 
          නමුත් පිරිත ඔබ විසින් ඔබටම සෙත් පිණිස සජ්ඣායනා කරගන්නා අවස්ථාවල පහත පරිදි සමහර වචන වෙනස් කර ගත යුතුය.
          බොහෝ අවස්ථාවල එසේ වෙනස් කළ යුතු පාලි වචන වරහන් තුළ දක්වා ඇත.
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm dark:text-main-dark">
            <thead>
              <tr class="border-b dark:border-line-dark">
                <th class="py-2 px-2">වචනය</th>
                <th class="py-2 px-2">වෙනස් කළ යුතු අයුරු</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(c, i) in pronounChanges" :key="i" class="border-b dark:border-line-dark last:border-0">
                <td class="py-2 px-2">{{ c[0] }}</td>
                <td class="py-2 px-2">{{ c[1] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Help / Youtube -->
      <div class="bg-surface dark:bg-surface-dark-alt rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-2 dark:text-main-dark">මෙම මෘදුකාංග වෙබ් අඩවිය භාවිතා කිරීමේ උපදෙස්</h3>
        <p class="text-sm text-muted dark:text-muted-dark mb-4">පහත බොත්තම එබීමෙන් උපදෙස් අඩංගු Youtube වීඩියෝ එකට පිවිසිය හැක</p>
        <a href="https://youtu.be/XFpYqlgT-a0" target="_blank" class="flex items-center text-primary hover:underline dark:text-main-dark">
           <YoutubeIcon class="w-5 h-5 mr-2 text-danger" />
           Youtube
        </a>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { pirithList } from '@/pirith-list.js'
import { Moon as MoonIcon, Sun as SunIcon, Repeat as RepeatIcon, Youtube as YoutubeIcon } from 'lucide-vue-next'

const store = usePlayerStore()

// Validation / Parsing helper
const rpcTextAr = t => t.split(' ').filter(x => x.length).map(x => parseInt(x))

const rules = [
  v => v.search(/[^\d ]/) == -1,
  v => rpcTextAr(v).length >= 2,
  v => rpcTextAr(v).length <= 5,
  v => rpcTextAr(v)[0] == 1,
  v => Math.max(...rpcTextAr(v)) <= 100000,
]

const repeatCountsText = computed({
  get: () => store.repeatCounts.join(' '),
  set: (text) => {
     if (rules.some(rule => !rule(text))) return // Ignore invalid input silently or add error state
     store.setRepeatCounts(rpcTextAr(text))
  }
})

const metrics = computed(() => {
  return store.playMetrics.map((count, i) => ({ name: pirithList[i][2], count }))
        .filter(m => m.count)
        .sort((a, b) => b.count - a.count)
})

const pronounChanges = [
  ['තේ', 'මේ'],
  ['තව', 'මම'],
  ['ත්වං', 'මං'],
  ['තුය්හං', 'මය්හං'],
  ['පරික්ඛිතොසි', 'පරික්ඛිතොස්මි'], //in jinapanjara
  ['චරාසි', 'චරාමි'], //in jinapanjara
]
</script>
