// used only by dev/prerender.js at build time
import { renderToString } from 'vue/server-renderer'
import { createPirithApp } from './app'
import { primeText, textKey } from './data'
import { headFor, renderHead, allPaths, SITE } from './seo'

export { allPaths, SITE }

/**
 * @param url   path inside the site, e.g. "/pages/09-rathana.html"
 * @param readText  (id, locale) => groups | null   - reads public/data/text
 */
export async function render(url, readText) {
  const { app, router } = createPirithApp()
  await router.push(url)
  await router.isReady()
  const route = router.currentRoute.value

  let state = null
  if (route.meta.page === 'pirith') {
    const groups = readText(route.params.id, route.meta.locale)
    if (groups) {
      const key = textKey(route.params.id, route.meta.locale)
      primeText(key, groups)
      state = { key, groups }
    }
  }
  const html = await renderToString(app)
  const head = headFor(route)
  return { html, head: renderHead(head), lang: head.lang, state }
}
