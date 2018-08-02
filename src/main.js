import Vue from 'vue'
import Buefy from 'buefy'
import VueClipboard2 from 'vue-clipboard2'
import Axios from 'axios'
import VueAxios from 'vue-axios'
import App from './App.vue'
import router from './router'
import LoadingBox from './components/LoadingBox'


Vue.use(Buefy)
Vue.use(VueClipboard2)
Vue.use(VueAxios, Axios)

Vue.component('loading-box', LoadingBox)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
