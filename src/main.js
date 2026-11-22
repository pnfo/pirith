import { createPirithApp } from './app'
import { primeText } from './data'
import { applyHead } from './seo'
import './style.css'

const el = document.getElementById('app')
const prerendered = el.hasAttribute('data-ssr')

// text of the prerendered page, so hydration does not need a second download
if (window.__PIRITH_TEXT__) primeText(window.__PIRITH_TEXT__.key, window.__PIRITH_TEXT__.groups)

const { app, router } = createPirithApp({ hydrate: prerendered })

// the apps always open at "/": go back to the language used last time
if (__APP__) {
  try {
    if (localStorage.getItem('locale') === 'en' && !location.hash.startsWith('#/en')) router.replace('/en/')
  } catch (e) { /* storage unavailable */ }
}

router.afterEach((to) => {
  applyHead(to)
  try { localStorage.setItem('locale', to.meta.locale || 'si') } catch (e) { /* ignore */ }
})

router.isReady().then(() => {
  app.mount(el)
  // links to the old single page app looked like /pirith/#/settings (after mounting, so hydration sees the page it was built for)
  if (!__APP__ && location.hash.startsWith('#/')) {
    const old = location.hash.slice(1)
    history.replaceState(history.state, '', location.pathname)
    if (old.startsWith('/settings')) router.replace('/settings/')
  }
})
