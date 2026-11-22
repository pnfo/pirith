import { computed } from 'vue'
import { useRoute } from 'vue-router'
import en from './en.js'
import si from './si.js'

const messages = { en, si }

/** the language comes from the URL (/en/...), so every page is linkable and indexable in both */
export function useI18n() {
  const route = useRoute()
  const locale = computed(() => route.meta.locale || 'si')

  const t = (key, vars) => {
    let result = messages[locale.value]
    for (const k of key.split('.')) result = result?.[k]
    if (typeof result !== 'string') return key
    return vars ? result.replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? '') : result
  }

  /** router location of a page in the current (or given) language */
  const to = (page, params, loc = locale.value) => ({ name: `${page}-${loc}`, params })

  return { t, to, locale }
}
