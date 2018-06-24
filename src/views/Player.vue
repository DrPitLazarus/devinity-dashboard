<template>
    <div class="player">
        <section class="section">
            <div class="container">
                <h1 class="title is-unselectable">Devinity Player Info</h1>
                <div class="columns">
                    <div class="column">
                        <div class="field has-addons">
                            <div class="control is-expanded">
                                <input @keyup.enter="handleSearchStart()" v-model.trim="searchQuery" type="text" class="input" placeholder="Enter Steam or Community ID...">
                            </div>
                            <div class="control">
                                <a @click="handleSearchStart()" class="button is-info">Search</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="section is-paddingless-top" v-cloak>
            <div class="container">
                <div class="columns" v-if="isDevinityPlayer || isValidSteamPlayer">
                    <div class="column is-narrow">
                        <figure class="image is-128x128">
                            <img :src="steamAvatarUrl" :alt="`${playerName}'s Steam avatar.`" :title="`${playerName}'s Steam avatar.`">
                        </figure>
                    </div>
                    <div class="column">
                        <h2 class="title is-4">{{ playerName }}</h2>
                        <h3 class="subtitle is-6" v-if="isDevinityPlayer">{{ general.viprankname }} from {{ countryName }}</h3>
                        <q v-if="isDevinityPlayer">{{ description }}</q>
                        <p v-if="isDevinityPlayer">Joined {{ joined }} &bull; {{ general.totalplaytimef }} total playtime</p>
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
                        <div class="notification" v-if="!isDevinityPlayer">This player has not played on our servers.</div>
                    </div>
                </div>
                <hr v-if="isDevinityPlayer">
                <div class="columns" v-if="isDevinityPlayer">
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
                            ['Achievements', `${flood.achcount} / ${flood.achcountmax}`]
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
                            ['Rounds Won', formatNumber(battleRoyale.roundswon)],
                            ['Rounds Played', formatNumber(battleRoyale.rounds)],
                            ['Kills', formatNumber(battleRoyale.kills)],
                            ['Deaths', formatNumber(battleRoyale.deaths)],
                            ['K/D Ratio', battleRoyale.kd],
                            ['Achievements', `${battleRoyale.achcount} / ${battleRoyale.achcountmax}`]
                        ]"/>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import Axios from 'axios'
import Big from 'big.js'
import CountryCodes from 'country-code-lookup'
import { eventBus } from '@/main'
import GamemodeTable from '@/components/GamemodeTable.vue'
import unknownAvatar from '@/assets/unknown.png'

const apiPath = "https://devinitydev.drpitlazar.us/api/player/"

export default {
    components: {
        GamemodeTable
    },
    data() {
        return {
            // searchQuery: "76561198029786366",
            searchQuery: "76561197977465334",
            isInvalidSearchQuery: false,
            isValidSteamPlayer: false,
            isDevinityPlayer: false,
            general: {},
            flood: {},
            battleRoyale: {},
            steam: {}
        }
    },
    methods: {
        copy(text) {
            this.$copyText(text).then(e => {
                eventBus.dispatch('copy-success', text, ['dfashf', 137291])
            })
        },
        formatNumber(num) {
            if (!num) { return }
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        },
        handleSearchStart() {
            this.resetPlayerValidity()
            if (!this.isValidSteamId()) {
                this.isInvalidSearchQuery = true
                return
            }
            if (/^STEAM_.:[0-1]:\d+$/.test(steamId)) {
                this.searchQuery = this.toSteamId64(steamId)
            }
            let steamId = this.searchQuery
            Axios.all([
                Axios.get(apiPath + steamId),
                Axios.get(apiPath + steamId + '/steam')
            ]).then(Axios.spread((player, steam) => {
                player = player.data, steam = steam.data
                this.general = player.general
                this.flood = player.flood
                this.battleRoyale = player.battleroyale
                this.steam = steam
                if (player.general.id) this.isDevinityPlayer = true
                if (steam.avatarfull) this.isValidSteamPlayer = true
            }))
        },
        lastPlayed(gamemode) {
            return gamemode['lastplayed'] 
                ? gamemode['lastplayed'] + ` (${gamemode['lastplayedrel']} ago)`
                : 'Never'
        },
        resetPlayerValidity() {
            this.isValidSteamPlayer = false
            this.isDevinityPlayer = false
        },
        isValidSteamId() {
            let steamId = this.searchQuery
            if (/^STEAM_.:[0-1]:\d+$/.test(steamId) || /^\d{17}$/.test(steamId)) {
                return true
            }
            return false
        },
        toSteamId64(steamId) {
            let base = new Big('76561197960265728'),
                result = steamid.match(/^STEAM_.:([0-1]):(\d+)$/),
                [, Y, Z] = result
            return base.plus(Y).plus(Z * 2).toString()
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
            if (!this.general.nationality && !this.steam.loccountrycode) return false
            return CountryCodes.byIso(this.general.nationality || this.steam.loccountrycode).country || (this.general.nationality || this.steam.loccountrycode)
        },
        playerName() {
            return this.general.nick || this.steam.personaname
        },
        steamAvatarUrl() {
            if (this.steam.avatarfull == 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg') {
                return unknownAvatar
            }
            return this.steam.avatarfull || unknownAvatar
        }
    }
}
</script>
