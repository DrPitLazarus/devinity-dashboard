<template>
    <div class="active-bans">
        <hr>
        <h2 class="title is-4">History</h2>

        <label class="label">Fetch by Perpetrator's Steam ID:</label>
        <b-field addons>
            <b-input @keypress.enter.native="handleFetchBySteamID()" v-model.trim="fetchBy.steamid" 
                expanded rounded placeholder="SteamID/Community ID/URL" spellcheck="off"/>
            <p class="control">
                <button @click="handleFetchBySteamID()" class="button is-rounded is-info">Fetch</button>
            </p>
        </b-field>
        <b-field label="Fetch by Admin:">
            <b-select placeholder="Select an Admin..." @input="handleFetchByAdmin($event)">
                <optgroup label="Current Staff">
                    <template v-for="admin of adminDropdown">
                        <option v-if="admin.rank > 4" :key="admin.steamid" :value="admin.steamid">{{ admin.nick }}</option>
                    </template>
                </optgroup>
                <optgroup label="Former Staff">
                    <template v-for="admin of adminDropdown">
                        <option v-if="admin.rank < 5" :key="admin.steamid" :value="admin.steamid">{{ admin.nick }}</option>
                    </template>
                </optgroup>
            </b-select>
        </b-field>


        <loading-box :active="isLoading"/>


        <b-table
            v-if="infractions.length"
            :data="filteredData"
            :mobile-cards="false"
            :paginated="true"
            :per-page="10"
            :narrowed="true"
            :default-sort="['date', 'desc']"
            default-sort-direction="desc"
            detailed
            detail-key="id"
            hoverable>
            <template slot-scope="props">
                <b-table-column field="perpnick" label="Player" width="300" sortable>
                    <router-link 
                        :to="{ name: 'player-summary', 
                            params: { steamId64: steamId32toSteamId64(props.row.perpsteamid) }}"
                        title="View player info.">
                        {{ props.row.perpnick }}
                    </router-link>
                </b-table-column>
                <b-table-column field="unbanremaining" label="Unban in" sortable>
                    {{ formatUnbanText(props.row) }}
                </b-table-column>
                <b-table-column field="date" label="Date" class="nowrap" sortable>
                    {{ props.row.date }}
                </b-table-column>
                <b-table-column field="type" label="Type" width="70" class="nowrap" sortable>
                    <b-icon v-if="props.row.type === 'ban'" icon="gavel" type="is-danger" />
                    <b-icon v-if="props.row.type === 'kick'" icon="logout" type="is-info" />
                    <b-icon v-if="props.row.type === 'warning'" icon="alert" />
                    {{ shortenTypeName(props.row.type) }}
                </b-table-column>
                <b-table-column field="cluster" label="Mode" width="20" sortable>
                    {{ shortenClusterName(props.row.cluster) }}
                </b-table-column>
                <b-table-column field="admin" label="Admin" width="300" sortable>
                    <router-link 
                        v-if="!['Anti-Cheat', 'VoteKick'].includes(props.row.adminsteamid)"
                        :to="{ name: 'player-summary', 
                            params: { steamId64: steamId32toSteamId64(props.row.adminsteamid) }}"
                        title="View player info.">
                        {{ props.row.adminnick }}
                    </router-link>
                    <template v-else>{{ props.row.adminnick }}</template>
                </b-table-column>
            </template>
            <template slot="detail" slot-scope="props">
                <div class="level is-paddingless">
                    <div class="level-item">
                        <p>
                            <strong>Reason: </strong>{{ props.row.reason }}
                        </p>
                    </div>
                    <div class="level-item">
                        <p>
                            <a :href="`https://devinity.org/pages/banscontrol/?banid=${props.row.id}`" target="_blank">Bans CP</a>
                        </p>
                    </div>
                </div>
            </template>
        </b-table>

        <b-field label="Filter by Unban Time:">
            <div class="block">
                <b-radio 
                    v-for="(option, index) of filters.unban" 
                    :key="index"
                    v-model="activeFilters.unban"
                    :native-value="index"
                    >
                    {{ option }}
                </b-radio>
            </div>
        </b-field>
        <b-field>
            <div class="block">
                <b-switch v-model="activeFilters.hideAntiCheat">Hide infractions from Anti-Cheat</b-switch>
            </div>
        </b-field>
        <b-field label="Filter by Type:">
            <div class="block">
                <b-radio 
                    v-for="(option, index) of filters.type" 
                    :key="index"
                    v-model="activeFilters.type"
                    :native-value="index"
                    >
                    {{ option }}
                </b-radio>
            </div>
        </b-field>
        <b-field label="Filter by Server:">
            <div class="block">
                <b-radio 
                    v-for="(option, index) of filters.server" 
                    :key="index"
                    v-model="activeFilters.server"
                    :native-value="index"
                    >
                    {{ option }}
                </b-radio>
            </div>
        </b-field>
    </div>
</template>

<script>
import { apiDevinityPath, steamId32toSteamId64 } from '@/config'

const apiInfractionsPath = apiDevinityPath + 'infractions'

export default {
    data() {
        return {
            infractions: [],
            isLoading: false,
            filters: {
                type: ['All', 'Ban', 'Kick', 'Warning'],
                server: ['All', 'Flood', 'Battle Royale'],
                unban: ['All', 'Permanent', 'Timed', 'Expired']
            },
            activeFilters: {
                hideAntiCheat: false,
                server: 0,
                type: 0,
                unban: 0
            },
            adminDropdown: [],
            fetchBy: {
                steamid: null
            }
        }
    },
    methods: {
        steamId32toSteamId64,
        async getInfractions() {
            this.isLoading = true
            let r = await this.$http(apiInfractionsPath)
            this.infractions = r.data
            this.isLoading = false
        },
        async getAdminList() {
            let r = await this.$http(apiInfractionsPath + '/getAllStaff')
            this.adminDropdown = r.data
        },
        async handleFetchByAdmin(e) {
            this.isLoading = true
            this.infractions = []
            let r = await this.$http(apiInfractionsPath + '/byAdmin/' + e)
            this.infractions = r.data
            this.isLoading = false
        },
        async handleFetchBySteamID() {
            this.isLoading = true
            this.infractions = []
            let r = await this.$http(apiInfractionsPath + '/bySteamId/' + this.fetchBy.steamid)
            this.fetchBy.steamid = null
            this.infractions = r.data
            this.isLoading = false
        },
        shortenClusterName(cluster) {
            if (!cluster) return '?'
            if (cluster === 'flood') return 'FM'
            if (cluster === 'battleroyale') return 'BR'
            return '???'
        },
        shortenTypeName(type) {
            if (!type) return '?'
            if (type === 'ban') return 'B'
            if (type === 'kick') return 'K'
            if (type === 'warning') return 'W'
            return '???'
        },
        formatUnbanText(row) {
            if (row.unbanremaining) return row.unbanremaining
            if (row.type === 'ban' && !row.unbanremaining) return 'Expired'
        },
        filterByUnbanTime(row) {
            if (this.activeFilters.unban === 0) return true
            else if (this.activeFilters.unban === 1 && row.unbanremaining) return row.unbanremaining === 'Permanent'
            else if (this.activeFilters.unban === 2 && row.unbanremaining) return row.unbanremaining !== 'Permanent'
            else if (this.activeFilters.unban === 3 && !row.unbanremaining && row.type === 'ban') return true
            return false
        },
        filterHideAntiCheat(admin) {
            if (this.activeFilters.hideAntiCheat === false) return true
            else return admin !== 'Anti-Cheat'
        },
        filterByType(row) {
            if (this.activeFilters.type === 0) return true
            else if (this.activeFilters.type === 1) return row.type === 'ban'
            else if (this.activeFilters.type === 2) return row.type === 'kick'
            else if (this.activeFilters.type === 3) return row.type === 'warning'
            return false
        },
        filterByServer(row) {
            if (this.activeFilters.server === 0) return true
            else if (this.activeFilters.server === 1) return row.cluster === 'flood'
            else if (this.activeFilters.server === 2) return row.cluster === 'battleroyale'
            return false
        }
    },
    computed: {
        filteredData() {
            let data = null
            data = this.infractions.filter(val => 
                this.filterByUnbanTime(val) 
                && this.filterHideAntiCheat(val.adminsteamid)
                && this.filterByType(val)
                && this.filterByServer(val)
            )
            return data
        }
    },
    created() {
        this.getInfractions()
        this.getAdminList()
    }

}
</script>
