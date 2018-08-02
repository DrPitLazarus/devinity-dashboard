<template>
    <div class="player-tab-battleroyale">
        <router-tabs
            :tabs="routerTabs"
            :path-level="3"
            />
        <br>
        <router-view class="spacer"/>
    </div>
</template>

<script>
import RouterTabs from '@/components/RouterTabs'

export default {
    name: 'PlayerTabBattleRoyale',
    components: {
        RouterTabs
    },
    data() {
        return {
            routerTabs: [
                {
                    text: 'Achievements',
                    to: {
                        name: 'player-tab-battleroyale-achievements'
                    }
                },
                {
                    text: 'Deaths',
                    to: {
                        name: 'player-tab-battleroyale-deaths'
                    }
                },
                {
                    text: 'Items',
                    to: {
                        name: 'player-tab-battleroyale-items'
                    }
                },
                {
                    text: 'Kills',
                    to: {
                        name: 'player-tab-battleroyale-kills'
                    }
                }
            ]
        }
    },
    created() {
        this.routerTabs = this.routerTabs.map(tab => {
            tab.to.params = this.$route.params
            return tab
        })
    }
}
</script>

<style scoped>
.spacer {
    min-height: 94vh;
}
</style>
