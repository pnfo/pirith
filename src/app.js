import { createApp, createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { createPirithRouter } from './router'

/** one factory for the browser, the apps and the build-time prerender */
export function createPirithApp({ hydrate = false } = {}) {
  const app = (hydrate || import.meta.env.SSR ? createSSRApp : createApp)(App)
  const router = createPirithRouter()
  app.use(createPinia())
  app.use(router)
  return { app, router }
}
