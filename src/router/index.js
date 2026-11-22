import { createRouter, createWebHistory, createWebHashHistory, createMemoryHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Pirith from '../views/Pirith.vue'

/**
 * URLs (web):  /pirith/                      home, sinhala
 *              /pirith/pages/<id>.html       one pirith, sinhala   <- these rank in google, never change them
 *              /pirith/settings/
 *              /pirith/en/...                same three in english
 * In the apps the same paths sit behind a # (hash routing) because pages load from local files.
 */
const pages = (prefix, locale) => [
  { path: `${prefix}/`, name: `home-${locale}`, component: Home, meta: { locale, page: 'home' } },
  { path: `${prefix}/pages/:id.html`, name: `pirith-${locale}`, component: Pirith, props: true, meta: { locale, page: 'pirith' } },
  { path: `${prefix}/settings/`, name: `settings-${locale}`, component: () => import('../views/Settings.vue'), meta: { locale, page: 'settings' } },
]

export function createPirithRouter() {
  const history = import.meta.env.SSR
    ? createMemoryHistory(import.meta.env.BASE_URL)
    : (__APP__ ? createWebHashHistory() : createWebHistory(import.meta.env.BASE_URL))

  return createRouter({
    history,
    routes: [
      ...pages('', 'si'),
      ...pages('/en', 'en'),
      { path: '/index.html', redirect: '/' },
      { path: '/:rest(.*)*', redirect: '/' },
    ],
    scrollBehavior(to, from, saved) {
      if (saved) return saved
      if (to.path !== from.path) return { top: 0 }
    },
  })
}
