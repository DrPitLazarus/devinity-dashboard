import Vue from 'vue'
import Router from 'vue-router'
import VueMeta from 'vue-meta'
import Home from './views/Home.vue'
import About from './views/About.vue'
import Player from './views/Player.vue'
import PlayerSummary from './views/Player/PlayerSummary'
import PlayerTabFlood from './views/Player/PlayerTabFlood'
import PlayerTabFloodFavWeapons from './views/Player/Flood/FavoriteWeapons'
import PlayerTabFloodOwnedWeapons from './views/Player/Flood/OwnedWeapons'
import PlayerTabFloodFavProps from './views/Player/Flood/FavoriteProps'
import PlayerTabFloodAchievements from './views/Player/Flood/Achievements'
import PlayerTabBattleRoyale from './views/Player/PlayerTabBattleRoyale'
import PlayerTabBattleRoyaleAchievements from './views/Player/BattleRoyale/Achievements'
import PlayerTabBattleRoyaleItems from './views/Player/BattleRoyale/Items'

Vue.use(Router)
Vue.use(VueMeta)

export default new Router({
  mode: 'history',
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
          path: ':steamId64(\\d{17}):playerName?',
          name: 'player-summary',
          component: PlayerSummary,
          children: [
            {
              path: 'flood',
              name: 'player-tab-flood',
              component: PlayerTabFlood,
              children: [
                {
                  path: 'achievements',
                  name: 'player-tab-flood-achievements',
                  component: PlayerTabFloodAchievements
                },
                {
                  path: 'favorite-props',
                  name: 'player-tab-flood-favprops',
                  component: PlayerTabFloodFavProps
                },
                {
                  path: 'favorite-weapons',
                  name: 'player-tab-flood-favweapons',
                  component: PlayerTabFloodFavWeapons
                },
                {
                  path: 'owned-weapons',
                  name: 'player-tab-flood-ownedweapons',
                  component: PlayerTabFloodOwnedWeapons
                }
              ]
            },
            {
              path: 'battle-royale',
              name: 'player-tab-battleroyale',
              component: PlayerTabBattleRoyale,
              children: [
                {
                  path: 'achievements',
                  name: 'player-tab-battleroyale-achievements',
                  component: PlayerTabBattleRoyaleAchievements
                },
                {
                  path: 'items',
                  name: 'player-tab-battleroyale-items',
                  component: PlayerTabBattleRoyaleItems
                }
              ]
            }
          ]
        }
      ]
    }
  ]
})
