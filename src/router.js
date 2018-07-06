import Vue from 'vue'
import Router from 'vue-router'
import VueMeta from 'vue-meta'
import Home from './views/Home.vue'
import About from './views/About.vue'
import Player from './views/Player.vue'
import PlayerSummary from './views/Player/PlayerSummary'

Vue.use(Router)
Vue.use(VueMeta)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/player',
      name: 'player',
      component: Player,
      children: [
        {
          path: ':steamId64(\\d{17})/:playerName?',
          name: 'player-summary',
          component: PlayerSummary
        }
      ]
    }
  ]
})
