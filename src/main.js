import Vue from 'vue'
import VueClipboard2 from 'vue-clipboard2'
import EventBus from 'eventbusjs'
import App from './App.vue'
import router from './router'

export const eventBus = EventBus

Vue.use(VueClipboard2)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
