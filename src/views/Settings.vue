<template>
  <div class="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
    <section class="card">
      <h2 class="card-title">{{ t(store.darkMode ? 'settings.darkMode.titleDay' : 'settings.darkMode.titleNight') }}</h2>
      <p class="card-desc">{{ t('settings.darkMode.desc') }}</p>
      <button @click="store.toggleDarkMode()" class="flex items-center px-4 py-2 border rounded text-primary border-primary dark:text-main-dark dark:border-line-dark">
        <component :is="store.darkMode ? SunIcon : MoonIcon" class="mr-2 w-5 h-5" />
        {{ t(store.darkMode ? 'settings.darkMode.btnLight' : 'settings.darkMode.btnDark') }}
      </button>
    </section>

    <section class="card">
      <h2 class="card-title">{{ t('settings.repeat.title') }}</h2>
      <p class="card-desc">{{ t('settings.repeat.desc') }}</p>
      <div class="flex items-center">
        <RepeatIcon class="w-5 h-5 mr-3 text-primary dark:text-muted-dark" />
        <input type="text" inputmode="numeric" v-model="repeatText" @input="onRepeatInput" placeholder="1 3 7 21 108" :aria-invalid="repeatInvalid"
          class="flex-grow min-w-0 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-surface-dark dark:border-line-dark"
          :class="repeatInvalid ? 'border-danger' : 'border-line'" />
      </div>
      <p v-if="repeatInvalid" class="text-sm text-danger mt-1">{{ t('settings.repeat.invalid') }}</p>
    </section>

    <section class="card">
      <h2 class="card-title">{{ t('settings.metrics.title') }}</h2>
      <p class="card-desc">{{ t('settings.metrics.desc') }}</p>
      <table v-if="metrics.length" class="w-full text-left text-sm">
        <thead><tr class="border-b dark:border-line-dark"><th class="py-2 px-2">{{ t('settings.metrics.colPirith') }}</th><th class="py-2 px-2">{{ t('settings.metrics.colCount') }}</th></tr></thead>
        <tbody>
          <tr v-for="m in metrics" :key="m.name" class="border-b last:border-0 dark:border-line-dark">
            <td class="py-2 px-2">{{ m.name }}</td><td class="py-2 px-2 text-primary font-medium dark:text-main-dark">{{ m.count }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="text-sm text-muted dark:text-muted-dark">{{ t('settings.metrics.none') }}</p>
    </section>

    <section class="card">
      <h2 class="card-title">{{ t('settings.pronouns.title') }}</h2>
      <p class="card-desc">{{ t('settings.pronouns.desc') }}</p>
      <table class="w-full text-left text-sm">
        <thead><tr class="border-b dark:border-line-dark"><th class="py-2 px-2">{{ t('settings.pronouns.colWord') }}</th><th class="py-2 px-2">{{ t('settings.pronouns.colChange') }}</th></tr></thead>
        <tbody>
          <tr v-for="c in pronouns" :key="c[0]" class="border-b last:border-0 dark:border-line-dark"><td class="py-2 px-2">{{ c[0] }}</td><td class="py-2 px-2">{{ c[1] }}</td></tr>
        </tbody>
      </table>
    </section>

    <section class="card">
      <h2 class="card-title">{{ t('settings.help.title') }}</h2>
      <p class="card-desc">{{ t('settings.help.desc') }}</p>
      <a href="https://youtu.be/XFpYqlgT-a0" target="_blank" rel="noopener" class="flex items-center text-primary underline dark:text-main-dark">
        <YoutubeIcon class="w-5 h-5 mr-2 text-danger" />Youtube
      </a>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { piriths, titleOf } from '@/catalog'
import { Moon as MoonIcon, Sun as SunIcon, Repeat as RepeatIcon, Youtube as YoutubeIcon } from 'lucide-vue-next'
import { useI18n } from '@/locales/index.js'

const store = usePlayerStore()
const { t, locale } = useI18n()

// repeat counts: 2 to 5 numbers, starting with 1
const repeatText = ref(store.repeatCounts.join(' '))
const repeatInvalid = ref(false)
watch(() => store.loaded, () => { repeatText.value = store.repeatCounts.join(' ') })
function onRepeatInput() {
  const nums = repeatText.value.trim().split(/\s+/).filter(Boolean).map(Number)
  const ok = !/[^\d ]/.test(repeatText.value) && nums.length >= 2 && nums.length <= 5 && nums[0] === 1 && Math.max(...nums) <= 100000
  repeatInvalid.value = !ok
  if (ok) store.setRepeatCounts(nums)
}

const metrics = computed(() => store.playMetrics
  .map((count, pInd) => ({ name: piriths[pInd] ? titleOf(piriths[pInd], locale.value) : '', count }))
  .filter(m => m.count && m.name)
  .sort((a, b) => b.count - a.count))

// words to change when chanting for oneself: [sinhala script, roman]
const pronouns = computed(() => [
  ['තේ', 'te', 'මේ', 'me'],
  ['තව', 'tava', 'මම', 'mama'],
  ['ත්වං', 'tvaṃ', 'මං', 'maṃ'],
  ['තුය්හං', 'tuyhaṃ', 'මය්හං', 'mayhaṃ'],
  ['පරික්ඛිතොසි', 'parikkhitosi', 'පරික්ඛිතොස්මි', 'parikkhitosmi'], // jinapanjara
  ['චරාසි', 'carāsi', 'චරාමි', 'carāmi'], // jinapanjara
].map(c => (locale.value === 'en' ? [c[1], c[3]] : [c[0], c[2]])))
</script>

<style scoped>
.card { @apply bg-surface rounded-lg shadow p-4 dark:bg-surface-dark-alt; }
.card-title { @apply text-lg font-semibold mb-2; }
.card-desc { @apply text-sm text-muted mb-4 dark:text-muted-dark; }
</style>
