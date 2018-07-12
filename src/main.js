import Vue from 'vue'
import Resource from 'vue-resource'
import Buefy from 'buefy'
import VueClipboard2 from 'vue-clipboard2'
import VueNotification from 'vue-notification'
import App from './App.vue'
import router from './router'

Vue.use(Resource)
Vue.use(Buefy)
Vue.use(VueNotification)
Vue.use(VueClipboard2)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
