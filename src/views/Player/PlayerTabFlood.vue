<template>
    <div class="player-tab-flood">
        <player-tab-buttons 
            :steam-id64="$route.params.steamId64"
            :player-name="$route.params.playerName"
            :buttons="buttons"/>
        <br>
        <router-view class="spacer"/>
    </div>
</template>

<script>
import PlayerTabButtons from '@/components/PlayerTabButtons'

export default {
    name: 'PlayerTabFlood',
    components: {
        PlayerTabButtons
    },
    data() {
        return {
            buttons: [
                {
                    title: 'Achievements',
                    to: 'player-tab-flood-achievements'
                },
                {
                    title: 'Fav. Props',
                    to: 'player-tab-flood-favprops'
                },
                {
                    title: 'Fav. Weapons',
                    to: 'player-tab-flood-favweapons'
                },
                {
                    title: 'Owned Weapons',
                    to: 'player-tab-flood-ownedweapons'
                }
            ]
        }
    }
}
</script>

<style scoped>
.spacer {
    min-height: 94vh;
}
</style>
