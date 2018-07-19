<template>
    <div class="player">
        <section class="section">
            <div class="container">
                <h1 class="title is-unselectable">Devinity Player Info</h1>
                <div class="columns">
                    <div class="column">
                        <div class="field has-addons">
                            <div class="control is-expanded">
                                <input 
                                    @keyup.enter="handleSearchStart()" 
                                    v-model.trim="searchQuery" 
                                    type="text" 
                                    class="input is-rounded" 
                                    placeholder="Enter Steam ID..." 
                                    spellcheck="false">
                            </div>
                            <div class="control">
                                <a 
                                    @click="handleSearchStart()" 
                                    class="button is-info is-rounded">
                                    Search
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <transition name="fade">
                    <article class="message is-warning" v-if="playerNotOnDevinity">
                        <div class="message-header">
                            <p>Player Not On Devinity</p>
                        </div>
                        <div class="message-body">
                            The Steam ID does not match a player on Devinity. 
                        </div>
                    </article>
                </transition>
                <transition name="fade">
                    <article class="message is-danger" v-if="queryInvalidFormat">
                        <div class="message-header">
                            <p>Query Invalid Format</p>
                        </div>
                        <div class="message-body">
                            <p>The query entered does not match a format pattern. See below for accepted Steam ID formats.</p>
                        </div>
                    </article>
                </transition>
                <transition name="fade">
                    <article class="message is-info" v-if="!steamId64IsValid || queryInvalidFormat">
                        <div class="message-header">
                            Enter one of the Steam ID formats below
                        </div>
                        <div class="message-body">
                            <dl>
                                <dt>Community ID</dt>
                                <dd>76561198029786366</dd>
                                <dt>Steam ID 32</dt>
                                <dd>STEAM_0:0:34760319</dd>
                                <dt>Steam Profile URL</dt>
                                <dd>https://steamcommunity.com/profiles/76561198029786366</dd>
                                <dd>https://steamcommunity.com/id/DrPitLazarus/</dd>
                            </dl>
                        </div>
                    </article>
                </transition>
                <router-view/>
            </div>
        </section>
    </div>
</template>

<script>
import Big from 'big.js'
import { apiBasePath, apiPlayerPath } from '@/config'

export default {
    metaInfo: {
        title: 'Player'
    },
    data() {
        return {
            // searchQuery: "76561198029786366",
            // searchQuery: "76561197977465334",
            searchQuery: null,
            queryInvalidFormat: false,
            playerNotOnDevinity: false,
            searchSubmitted: false
        }
    },
    methods: {
        ifPlayerIsOnDevinity(steamId64, cb) {
            this.$http.get(apiPlayerPath + steamId64 + '/isPlayer')
                .then(res => {
                    cb(res)
                })
        },
        async handleSearchStart() {
            this.resetQueryValidity()
            let query = this.searchQuery
            if (!this.isValidQuery(query)) {
                this.queryInvalidFormat = true
                return
            }
            let steamId64 = await this.convertSteamIdTo64(query)
            this.ifPlayerIsOnDevinity(steamId64, res => {
                if (res.data.response) {
                        this.$router.push({
                            name: 'player-summary', 
                            params: {
                                steamId64
                            }
                        })
                    } 
                    else {
                        this.playerNotOnDevinity = true
                    }
                    this.searchSubmitted = true
            })
        },
        resetQueryValidity() {
            this.queryInvalidFormat = false
            this.playerNotOnDevinity = false
        },
        toSteamId64(steamId) {
            let base = new Big('76561197960265728'),
                result = steamId.match(/^STEAM_.:([0-1]):(\d+)$/),
                [, Y, Z] = result
            return base.plus(Y).plus(Z * 2).toString()
        },
        isCommunityId(id) {
            return /^\d{17}$/.test(id)
        },
        isSteamId32(id) {
            return /^STEAM_.:[0-1]:\d+$/.test(id)
        },
        isSteamProfileUrl(url) {
            return /steamcommunity\.com\/profiles\/(\d{17}\/?)$/.test(url)
        },
        isSteamProfileIdUrl(url) {
            return /steamcommunity\.com\/id\/([a-zA-Z0-9_-]{2,32}\/?)$/.test(url)
        },
        isValidQuery(query) {
            return this.isCommunityId(query) 
                || this.isSteamId32(query) 
                || this.isSteamProfileUrl(query)
                || this.isSteamProfileIdUrl(query)
        },
        async convertSteamIdTo64(steamId) {
            if (this.isCommunityId(steamId)) {
                return steamId
            } else if (this.isSteamId32(steamId)) {
                return this.toSteamId64(steamId)
            } else if (this.isSteamProfileUrl(steamId)) {
                let result = steamId.match(/\d{17}/)[0]
                return result
            } else if (this.isSteamProfileIdUrl(steamId)) {
                let result = steamId.match(/([0-9a-zA-Z_-]{2,32})(?:\/)$/)[1]
                let res = await this.$http(apiBasePath + 'steam/vanity/' + result)
                return res.data.steamid
            }
        }
    },
    computed: {
        steamId64IsValid() {
            return this.$route.params.steamId64 || this.searchSubmitted
        }
    },
    created() {
        if (this.$route.params.steamId64) {
            this.ifPlayerIsOnDevinity(this.$route.params.steamId64, r => {
                if (!r.data.response) this.playerNotOnDevinity = true
            })
        }
    }
}
</script>

<style scoped>
    .player .message-body {
        overflow-wrap: break-word;
    }
    .player dt {
        font-weight: bold;
    }

    .fade-enter-active, .fade-leave-active {
        transition: all .7s ease;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }
</style>
