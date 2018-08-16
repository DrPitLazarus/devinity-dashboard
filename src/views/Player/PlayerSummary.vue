<template>
    <div class="player-summary">
        <section class="is-paddingless-top" v-cloak>
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
                        <p>Joined {{ joined }} &bull; {{ general.totalplaytimef }} total playtime &bull; {{ formatNumber(general.tokens) }} tokens</p>
                    </div>
                    <div class="column is-5">
                        <div class="buttons">
                            <button class="button" title="Click to copy Steam Community ID." @click="copy(steam.steamid)">{{ steam.steamid }}</button>
                            <button class="button" title="Click to copy Steam ID 32." @click="copy(steam.steamid32)">{{ steam.steamid32 }}</button>
                            <a class="button" 
                            :href="`https://steamcommunity.com/profiles/${steam.steamid}`" title="Open Steam profile.">Steam</a>
                            <a class="button" v-if="general.forumid" 
                            :href="`https://devinity.org/members/${general.forumid}`" title="Open Devinity forum profile.">Forum</a>
                        </div>
                        <div class="notification is-danger" v-if="currentBan">
                            <p>This player is currently banned from our servers.</p>
                            <p>
                                <q>{{ currentBan.reason }}</q> by 
                                <template v-if="isAdminPlayer(currentBan.admin)">
                                    <router-link 
                                        :to="{ name: 'player-summary', params: { steamId64: steamId32toSteamId64(getAdminSteamId(currentBan.admin)) } }"
                                        title="View player info.">
                                        {{ formatAdminName(currentBan.admin) }}</router-link>. 
                                </template>
                                <template v-else>{{ currentBan.admin }}.</template>
                                {{ currentBanLength }}.
                            </p>
                        </div>
                        <div class="notification" v-if="isSteamBanned">
                            <p>Steam ban info:</p>
                            <span v-if="steam.bans.NumberOfVACBans > 0">{{ steam.bans.NumberOfVACBans }} VAC ban(s). </span>
                            <span v-if="steam.bans.NumberOfGameBans > 0">{{ steam.bans.NumberOfGameBans }} game ban(s). </span>
                            <span>{{ steam.bans.DaysSinceLastBan }} day(s) since last ban. </span>
                        </div>
                    </div>
                </div>
                <router-tabs
                :tabs="routerTabs"
                :path-level="2"
                :default="true"
                @change="showSummary = $event === 0"
                />
                <hr>
                <div class="columns" v-if="showSummary">
                    <div class="column">
                        <h2 class="title is-4">Flood</h2>
                        <div class="notification" v-if="!flood.lastplayed">This player has not played this gamemode on our servers.</div>
                        <h3 class="subtitle is-6" v-if="flood.lastplayed">Level {{ flood.plvl }} &bull; {{ flood.playtimef }} playtime</h3>
                        <gamemode-table v-if="flood.lastplayed" :data="[
                            ['Last Played', lastPlayed(flood)],
                            ['Cash', formatNumber(flood.cash)],
                            ['Cash Earned', formatNumber(flood.cashearned)],
                            ['Rounds Won', formatNumber(flood.roundswon)],
                            ['Rounds Played', formatNumber(flood.rounds)],
                            ['Weapon Value', formatNumber(flood.wepvalue)],
                            ['Damage', formatNumber(flood.damage)],
                            ['Props Destroyed', formatNumber(flood.destroyed)],
                            ['Achievements', `${flood.achcount}/${flood.achcountmax}`]
                        ]"/>
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
                            ['Coins', formatNumber(battleRoyale.coins)],
                            ['Rounds Won', formatNumber(battleRoyale.roundswon)],
                            ['Rounds Played', formatNumber(battleRoyale.rounds)],
                            ['Kills', formatNumber(battleRoyale.kills)],
                            ['Deaths', formatNumber(battleRoyale.deaths)],
                            ['K/D Ratio', battleRoyale.kd],
                            ['Achievements', `${battleRoyale.achcount}/${battleRoyale.achcountmax}`]
                        ]"/>
                    </div>
                </div>
                <router-view class="spacer"/>
            </div>
        </section>
    </div>
</template>

<script>
import CountryCodes from 'country-code-lookup'
import Slugify from 'slugify'
import GamemodeTable from '@/components/GamemodeTable'
import RouterTabs from '@/components/RouterTabs'
import unknownAvatar from '@/assets/unknown.png'
import { apiPlayerPath, formatNumber, steamId32toSteamId64 } from '@/config'

export default {
    name: 'PlayerSummary',
    components: {
        GamemodeTable,
        RouterTabs
    },
    metaInfo() {
        return {
            title: `Player: ${this.playerName}`
        }
    },
    data() {
        return {
            general: {},
            flood: {},
            battleRoyale: {},
            steam: {},
            showSummary: true,
            currentBan: false,
            routerTabs: [
                {
                    text: 'Summary',
                    to: {
                        name: 'player-summary'
                    }
                },
                {
                    text: 'Flood',
                    to: {
                        name: 'player-tab-flood'
                    }
                },
                {
                    text: 'Battle Royale',
                    to: {
                        name: 'player-tab-battleroyale'
                    }
                }
            ]
        }
    },
    methods: {
        formatNumber,
        Slugify,
        steamId32toSteamId64,
        copy(text) {
            this.$copyText(text)
            this.$toast.open({
                message: `Copied '${text}'.`
            })
        },
        fetchPlayerData() {
            let steamId = this.$route.params.steamId64
            this.$http.all([
                this.$http(apiPlayerPath + steamId),
                this.$http(apiPlayerPath + steamId + '/steam'),
                this.$http(apiPlayerPath + steamId + '/steamBans'),
                this.$http(apiPlayerPath + steamId + '/currentBan')
            ]).then(this.$http.spread((player, steam, steamBans, currentBan) => {
                player = player.data, steam = steam.data
                this.general = player.general
                this.flood = player.flood
                this.battleRoyale = player.battleroyale
                this.steam = steam
                this.$set(this.steam, 'bans', steamBans.data)
                this.currentBan = currentBan.data
                this.updateParamPlayerName()
            }))            
        },
        lastPlayed(gamemode) {
            return gamemode['lastplayed'] 
                ? gamemode['lastplayed'] + ` (${gamemode['lastplayedrel']} ago)`
                : 'Never'
        },
        updateParamPlayerName() {
            if (!this.$route.params.playerName || Slugify('-' + this.$route.params.playerName) != Slugify('-' + this.playerName)) {
                this.$router.replace({ name: this.$route.name, params: {
                    steamId64: this.$route.params.steamId64,
                    playerName: Slugify('-' + this.playerName)
                }})
                this.appendParamsToRouterTabs()
            }
        },
        appendParamsToRouterTabs() {
            this.routerTabs = this.routerTabs.map(tab => {
                tab.to.params = this.$route.params
                return tab
            })
        },
        getAdminSteamId(admin) {
            return admin.substring(admin.indexOf('(STEAM_0:') + 1, admin.length - 1)
        },
        formatAdminName(admin) {
            return admin.substring(0, admin.indexOf('(STEAM_0:'))
        },
        isAdminPlayer(admin) {
            return !['(Console)', 'Anti-Cheat'].includes(admin)
        }
    },
    computed: {
        currentBanLength() {
            return this.currentBan.unban == 0 ? 'Banned permanently' : this.currentBan.timeleft + ' remaining'
        },
        description() {
            return this.general.description || 'No description set.'
        },
        joined() {
            if (!this.general.joined) return false
            return this.general.joined.endsWith('*')
                ? `before ${this.general.joined.substr(0, 10)}`
                : `on ${this.general.joined.substr(0, 10)}`
        },
        countryName() {
            if (!this.general.nationality) return "Somewhere"
            if (CountryCodes.byIso(this.general.nationality)) return CountryCodes.byIso(this.general.nationality).country
            if (CountryCodes.byFips(this.general.nationality)) return (CountryCodes.byFips(this.general.nationality)).country
        },
        playerName() {
            return this.general.nick || this.steam.personaname || ""
        },
        steamAvatarUrl() {
            if (this.steam.avatarfull == 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg') {
                return unknownAvatar
            }
            return this.steam.avatarfull || unknownAvatar
        },
        isSteamBanned() {
            return this.steam.bans.NumberOfVACBans > 0 || this.steam.bans.NumberOfGameBans > 0
        }
    },
    created() {
        this.appendParamsToRouterTabs()
        this.fetchPlayerData()
    },
    watch: {
        '$route.params.steamId64'() {
            this.fetchPlayerData()
        },
        '$route.params.playerName'() {
            this.updateParamPlayerName()
        }
    }
}
</script>

<style scoped>
.player-summary .steam-avatar {
    border-radius: 15%;
}
.spacer {
    min-height: 94vh;
}
</style>
