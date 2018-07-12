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
                    title: 'Items',
                    to: 'player-tab-battleroyale-items'
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
