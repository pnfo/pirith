import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// import { library } from '@fortawesome/fontawesome-svg-core'
// import { faUserSecret } from '@fortawesome/pro-solid-svg-icons'
// import { far } from '@fortawesome/pro-regular-svg-icons'
// import { fal } from '@fortawesome/pro-light-svg-icons'
// import { fab } from '@fortawesome/free-brands-svg-icons'
// import { fas } from '@fortawesome/free-solid-svg-icons'
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import vuetify from './plugins/vuetify';
// library.add(faUserSecret)
// library.add(fas, far, fal, fab)

//Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
