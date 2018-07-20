<template>
    <div class="player-search-modal">
        <b-modal :active="active" @close="$emit('close')" scroll="keep">
            <article class="message">
                <div class="message-header">
                    <p>Select Player from List</p>
                </div>
                <div class="message-body">
                    <b-tabs type="is-toggle-rounded" :animated="false" @change="handleTabChange">
                        <b-tab-item label="Staff">
                            <b-table
                                :data="staff"
                                :mobile-cards="false"
                                hoverable>
                                <template slot-scope="props">
                                    <b-table-column field="nick" label="Name" sortable>
                                        <a @click="playerClicked(props.row.steamid)">{{ props.row.nick || "unknown" }}</a>
                                    </b-table-column>
                                    <b-table-column field="viprank" label="Rank" width="120" sortable>
                                        {{ props.row.viprankname }}
                                    </b-table-column>
                                </template>
                            </b-table>
                        </b-tab-item>
                        <b-tab-item label="Flood">
                            <h3 class="title is-4">Connected</h3>
                            <b-table
                                :data="floodConnected"
                                :mobile-cards="false"
                                :paginated="true"
                                :per-page="5"
                                :pagination-simple="true"
                                hoverable>
                                <template slot-scope="props">
                                    <b-table-column field="nick" label="Name" sortable>
                                        <a @click="playerClicked(props.row.steamid)">{{ props.row.nick || "unknown" }}</a>
                                    </b-table-column>
                                    <b-table-column field="server" label="Server" width="20" sortable>
                                        {{ props.row.server }}
                                    </b-table-column>
                                </template>
                            </b-table>

                            <h3 class="title is-4">Recent</h3>
                            <b-table
                                :data="floodRecent"
                                :mobile-cards="false"
                                :paginated="true"
                                :per-page="5"
                                :pagination-simple="true"
                                hoverable>
                                <template slot-scope="props">
                                    <b-table-column field="nick" label="Name" sortable>
                                        <a @click="playerClicked(props.row.steamid)">{{ props.row.nick || "unknown" }}</a>
                                    </b-table-column>
                                    <b-table-column field="server" label="Server" width="20" sortable>
                                        {{ props.row.server }}
                                    </b-table-column>
                                </template>
                            </b-table>
                        </b-tab-item>
                        <b-tab-item label="Battle Royale">
                            <h3 class="title is-4">Connected</h3>
                            <b-table
                                :data="battleroyaleConnected"
                                :mobile-cards="false"
                                :paginated="true"
                                :per-page="5"
                                :pagination-simple="true"
                                hoverable>
                                <template slot-scope="props">
                                    <b-table-column field="nick" label="Name" sortable>
                                        <a @click="playerClicked(props.row.steamid)">{{ props.row.nick || "unknown" }}</a>
                                    </b-table-column>
                                    <b-table-column field="server" label="Server" width="20" sortable>
                                        {{ props.row.server }}
                                    </b-table-column>
                                </template>
                            </b-table>

                            <h3 class="title is-4">Recent</h3>
                            <b-table
                                :data="battleroyaleRecent"
                                :mobile-cards="false"
                                :paginated="true"
                                :per-page="5"
                                :pagination-simple="true"
                                hoverable>
                                <template slot-scope="props">
                                    <b-table-column field="nick" label="Name" sortable>
                                        <a @click="playerClicked(props.row.steamid)">{{ props.row.nick || "unknown" }}</a>
                                    </b-table-column>
                                    <b-table-column field="server" label="Server" width="20" sortable>
                                        {{ props.row.server }}
                                    </b-table-column>
                                </template>
                            </b-table>
                        </b-tab-item>
                    </b-tabs>
                </div>
            </article>
        </b-modal>
    </div>
</template>

<script>
import { apiBasePath } from '@/config'

export default {
    name: 'PlayerSearchModal',
    props: {
        active: Boolean
    },
    data() {
        return {
            staff: [],
            floodConnected: [],
            floodRecent: [],
            battleroyaleConnected: [],
            battleroyaleRecent: []
        }
    },
    methods: {
        getStaff() {
            this.$http(apiBasePath + 'devinity/staff2')
            .then(r => this.staff = r.data)
        },
        async getFloodConnected() {
            let r = await this.$http(apiBasePath + 'devinity/flood/connectedPlayers')
            this.floodConnected = r.data
        },
        async getFloodRecent() {
            let r = await this.$http(apiBasePath + 'devinity/flood/recentPlayers')
            this.floodRecent = r.data
        },
        async getBattleRoyaleConnected() {
            let r = await this.$http(apiBasePath + 'devinity/battleroyale/connectedPlayers')
            this.battleroyaleConnected = r.data
        },
        async getBattleRoyaleRecent() {
            let r = await this.$http(apiBasePath + 'devinity/battleroyale/recentPlayers')
            this.battleroyaleRecent = r.data
        },
        handleTabChange(e) {
            switch (e) {
                case 0: 
                    this.getStaff()
                    break
                case 1: 
                    this.getFloodConnected()
                    this.getFloodRecent()
                    break
                case 2:
                    this.getBattleRoyaleConnected()
                    this.getBattleRoyaleRecent()
                    break
            }
        },
        playerClicked(steamid) {
            this.$emit('steamid', steamid)
        }
    },
    created() {
        this.handleTabChange(0)
    }
}
</script>

<style lang="scss">
.player-search-modal .tabs {
    & a {
        text-decoration: none !important;
    }
    
    & li.is-active a {
        background-color: #292929 !important;
        border-color: #292929 !important;
    }
}
</style>
