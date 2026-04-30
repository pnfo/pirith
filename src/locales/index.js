import { reactive, computed } from 'vue'
import en from './en.js'
import si from './si.js'
import { convert, Script } from '@pnfo/pali-converter'

const messages = { en, si }

const state = reactive({
  locale: localStorage.getItem('locale') || 'si'
})

export function setLocale(locale) {
  state.locale = locale
  localStorage.setItem('locale', locale)
}

export function useI18n() {
  const t = (key) => {
    const keys = key.split('.')
    let result = messages[state.locale]
    for (const k of keys) {
      if (result) result = result[k]
    }
    return result || key
  }

  const tPali = (text) => {
    if (state.locale === 'en' && text) {
      return convert(text, Script.RO, Script.SI)
    }
    return text
  }

  return { t, tPali, locale: computed(() => state.locale), setLocale }
}
