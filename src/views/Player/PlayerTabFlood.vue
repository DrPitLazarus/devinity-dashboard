<template>
    <div class="player-tab-flood">
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
    name: 'PlayerTabFlood',
    components: {
        RouterTabs
    },
    data() {
        return {
            routerTabs: [
                {
                    text: 'Achievements',
                    to: {
                        name: 'player-tab-flood-achievements'
                    }
                },
                {
                    text: 'Fav. Props',
                    to: {
                        name: 'player-tab-flood-favprops'
                    }
                },
                {
                    text: 'Fav. Weapons',
                    to: {
                        name: 'player-tab-flood-favweapons'
                    }
                },
                {
                    text: 'Owned Weapons',
                    to: {
                        name: 'player-tab-flood-ownedweapons'
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
