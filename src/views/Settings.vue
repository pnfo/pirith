<template>
  <div class="p-4 space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

      <!-- Dark Mode -->
      <div class="bg-surface dark:bg-surface-dark-alt rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-2 dark:text-main-dark" v-if="!store.darkMode">{{ t('settings.darkMode.titleNight') }}</h3>
        <h3 class="text-lg font-semibold mb-2 dark:text-main-dark" v-else>{{ t('settings.darkMode.titleDay') }}</h3>
        <p class="text-sm text-muted dark:text-muted-dark mb-4">{{ t('settings.darkMode.desc') }}</p>
        <button 
          @click="store.toggleDarkMode()" 
          class="flex items-center px-4 py-2 border rounded text-primary border-primary hover:bg-primary hover:text-white transition-colors dark:text-main-dark dark:border-line-dark dark:hover:bg-surface-dark"
        >
          <SunIcon v-if="store.darkMode" class="mr-2 w-5 h-5" />
          <MoonIcon v-else class="mr-2 w-5 h-5" />
          {{ store.darkMode ? t('settings.darkMode.btnLight') : t('settings.darkMode.btnDark') }}
        </button>
      </div>

      <!-- Repeat Counts -->
      <div class="bg-surface dark:bg-surface-dark-alt rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-2 dark:text-main-dark">{{ t('settings.repeat.title') }}</h3>
        <p class="text-sm text-muted dark:text-muted-dark mb-4">{{ t('settings.repeat.desc') }}</p>
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
        <h3 class="text-lg font-semibold mb-2 dark:text-main-dark">{{ t('settings.metrics.title') }}</h3>
        <p class="text-sm text-muted dark:text-muted-dark mb-4">
          {{ t('settings.metrics.desc') }}
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm dark:text-main-dark">
            <thead>
              <tr class="border-b dark:border-line-dark">
                <th class="py-2 px-2">{{ t('settings.metrics.colPirith') }}</th>
                <th class="py-2 px-2">{{ t('settings.metrics.colCount') }}</th>
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
        <h3 class="text-lg font-semibold mb-2 dark:text-main-dark">{{ t('settings.pronouns.title') }}</h3>
        <p class="text-sm text-muted dark:text-muted-dark mb-4">
          {{ t('settings.pronouns.desc') }}
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm dark:text-main-dark">
            <thead>
              <tr class="border-b dark:border-line-dark">
                <th class="py-2 px-2">{{ t('settings.pronouns.colWord') }}</th>
                <th class="py-2 px-2">{{ t('settings.pronouns.colChange') }}</th>
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
        <h3 class="text-lg font-semibold mb-2 dark:text-main-dark">{{ t('settings.help.title') }}</h3>
        <p class="text-sm text-muted dark:text-muted-dark mb-4">{{ t('settings.help.desc') }}</p>
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
import { useI18n } from '@/locales/index.js'

const store = usePlayerStore()
const { t, tPali } = useI18n()

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
  return store.playMetrics.map((count, i) => ({ name: tPali(pirithList[i]?.[2] || ''), count }))
        .filter(m => m.count)
        .sort((a, b) => b.count - a.count)
})

const pronounChanges = computed(() => {
  return [
    ['තේ', 'මේ'],
    ['තව', 'මම'],
    ['ත්වං', 'මං'],
    ['තුය්හං', 'මය්හං'],
    ['පරික්ඛිතොසි', 'පරික්ඛිතොස්මි'], //in jinapanjara
    ['චරාසි', 'චරාමි'], //in jinapanjara
  ].map(c => [tPali(c[0]), tPali(c[1])])
})
</script>
