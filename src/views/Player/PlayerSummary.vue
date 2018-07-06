<template>
    <div class="player-summary">
        <section class="section is-paddingless-top" v-cloak>
            <div class="container" v-if="general.id">
                <div class="columns">
                    <div class="column is-narrow">
                        <figure class="image is-128x128">
                            <img :src="steamAvatarUrl" :alt="`${playerName}'s Steam avatar.`" :title="`${playerName}'s Steam avatar.`" class="steam-avatar">
                        </figure>
                    </div>
                    <div class="column">
                        <h2 class="title is-4">{{ playerName }}</h2>
                        <h3 class="subtitle is-6">{{ general.viprankname || "Player" }} from {{ countryName }}</h3>
                        <q>{{ description }}</q>
                        <p>Joined {{ joined }} &bull; {{ general.totalplaytimef }} total playtime</p>
                    </div>
                    <div class="column is-5">
                        <div class="buttons">
                            <button class="button" title="Click to copy SteamID." @click="copy(steam.steamid)">{{ steam.steamid }}</button>
                            <button class="button" title="Click to copy SteamID32." @click="copy(steam.steamid32)">{{ steam.steamid32 }}</button>
                            <a class="button" 
                            :href="`https://steamcommunity.com/profiles/${steam.steamid}`" title="Open Steam profile.">Steam</a>
                            <a class="button" v-if="general.forumid" 
                            :href="`https://devinity.org/members/${general.forumid}`" title="Open Devinity forum profile.">Forum</a>
                        </div>
                        <div class="notification is-danger" v-if="general.isbanned == 1">This player is currently banned from our servers.</div>
                    </div>
                </div>
                <hr>
                <div class="columns">
                    <div class="column">
                        <h2 class="title is-4">Flood</h2>
                        <div class="notification" v-if="!flood.lastplayed">This player has not played this gamemode on our servers.</div>
                        <h3 class="subtitle is-6" v-if="flood.lastplayed">Level {{ flood.plvl }} &bull; {{ flood.playtimef }} playtime</h3>
                        <gamemode-table v-if="flood.lastplayed" :data="[
                            ['Last Played', lastPlayed(flood)],
                            ['Cash', formatNumber(flood.cash)],
                            ['Tokens', formatNumber(flood.tokens)],
                            ['Cash Earned', formatNumber(flood.cashearned)],
                            ['Weapon Value', formatNumber(flood.wepvalue)],
                            ['Damage', formatNumber(flood.damage)],
                            ['Props Destroyed', formatNumber(flood.destroyed)],
                            ['Achievements', `${flood.achcount}/${flood.achcountmax}`]
                        ]"/>
                        <br>
                        <div v-if="flood.favoriteweapon" class="notification">
                            <h4 class="title is-6">Favorite Weapon: {{ flood.favoriteweapon.name }}</h4>
                            <p>
                                Used {{ formatNumber(flood.favoriteweapon.usecount) }} times with an accuracy of 
                                {{ flood.favoriteweapon.accuracy }}% ({{ formatNumber(flood.favoriteweapon.hits) }}
                                hits/{{ formatNumber(flood.favoriteweapon.shots) }} shots).
                            </p>
                        </div>
                    </div>
                    <div class="column is-narrow">
                        <hr class="is-vertical">
                    </div>
                    <div class="column">
                        <h2 class="title is-4">Battle Royale</h2>
                        <div class="notification" v-if="!battleRoyale.lastplayed">This player has not played this gamemode on our servers.</div>
                        <h3 class="subtitle is-6" v-if="battleRoyale.lastplayed">Level {{ battleRoyale.plvl }} &bull; {{ battleRoyale.playtimef }} playtime</h3>
                        <gamemode-table v-if="battleRoyale.lastplayed" :data="[
                            ['Last Played', lastPlayed(battleRoyale)],
                            ['Experience', formatNumber(battleRoyale.exp)],
                            ['Rounds Won', formatNumber(battleRoyale.roundswon)],
                            ['Rounds Played', formatNumber(battleRoyale.rounds)],
                            ['Kills', formatNumber(battleRoyale.kills)],
                            ['Deaths', formatNumber(battleRoyale.deaths)],
                            ['K/D Ratio', battleRoyale.kd],
                            ['Achievements', `${battleRoyale.achcount}/${battleRoyale.achcountmax}`]
                        ]"/>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import Axios from 'axios'
import CountryCodes from 'country-code-lookup'
import GamemodeTable from '@/components/GamemodeTable.vue'
import unknownAvatar from '@/assets/unknown.png'

const apiPath = "https://devinitydev.drpitlazar.us/api/player/"

export default {
    name: 'PlayerSummary',
    components: {
        GamemodeTable
    },
    metaInfo() {
        return {
            meta: [
                { 
                    vmid: 'description', 
                    name: 'description', 
                    content: `${this.playerName} is a ${this.general.viprankname} from ${this.countryName} on Devinity.
                    Community ID: ${this.general.steamid}. Steam ID 32: ${this.general.steamid32}.`}
            ],
            title: `Player: ${this.playerName}`
        }
    },
    data() {
        return {
            general: {},
            flood: {},
            battleRoyale: {},
            steam: {}
        }
    },
    methods: {
        copy(text) {
            this.$copyText(text)
            this.$notify({
                type: 'is-info',
                text: `Copied '${text}'.`
                })
        },
        formatNumber(num) {
            if (!num) return
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        },
        fetchPlayerData() {
            let steamId = this.$route.params.steamId64
            this.$notify({
                duration: -1,
                text: 'Fetching player data...'
                })
            Axios.all([
                Axios.get(apiPath + steamId),
                Axios.get(apiPath + steamId + '/steam')
            ]).then(Axios.spread((player, steam) => {
                this.$notify({clear: true})
                player = player.data, steam = steam.data
                this.general = player.general
                this.flood = player.flood
                this.battleRoyale = player.battleroyale
                this.steam = steam
                if (player.general.id) {
                    this.getFloodExtraData(steamId)
                }
            }))            
        },
        getFloodExtraData(steamId) {
            Axios.all([
                Axios.get(apiPath + steamId + '/floodFavoriteWeapon')
            ]).then(Axios.spread(floodFavWep => {
                this.$set(this.flood, 'favoriteweapon', floodFavWep.data)
            }))
        },
        lastPlayed(gamemode) {
            return gamemode['lastplayed'] 
                ? gamemode['lastplayed'] + ` (${gamemode['lastplayedrel']} ago)`
                : 'Never'
        }
    },
    computed: {
        description() {
            return this.general.description || 'No description set.'
        },
        isBanned() {
            return this.general.isbanned == 1 ? 'Yes' : 'No'
        },
        joined() {
            if (!this.general.joined) return false
            return this.general.joined.endsWith('*')
                ? `before ${this.general.joined.substr(0, 10)}`
                : `on ${this.general.joined.substr(0, 10)}`
        },
        countryName() {
            if (!this.general.nationality && !this.steam.loccountrycode) return "Somewhere"
            return CountryCodes.byIso(this.general.nationality || this.steam.loccountrycode).country || (this.general.nationality || this.steam.loccountrycode)
        },
        playerName() {
            return this.general.nick || this.steam.personaname || ""
        },
        steamAvatarUrl() {
            if (this.steam.avatarfull == 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg') {
                return unknownAvatar
            }
            return this.steam.avatarfull || unknownAvatar
        }
    },
    mounted() {
        this.fetchPlayerData()
    },
    watch: {
        '$route.params.steamId64'() {
            this.fetchPlayerData()
        }
    }
}
</script>

<style scoped>
.player-summary .steam-avatar {
    border-radius: 15%;
}
</style>
