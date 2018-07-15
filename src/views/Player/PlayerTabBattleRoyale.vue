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
    name: 'PlayerTabBattleRoyale',
    components: {
        PlayerTabButtons
    },
    data() {
        return {
            buttons: [
                {
                    title: 'Achievements',
                    to: 'player-tab-battleroyale-achievements'
                },
                {
                    title: 'Deaths',
                    to: 'player-tab-battleroyale-deaths'
                },
                {
                    title: 'Items',
                    to: 'player-tab-battleroyale-items'
                },
                {
                    title: 'Kills',
                    to: 'player-tab-battleroyale-kills'
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
