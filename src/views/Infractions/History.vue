<template>
    <div class="history">
        <hr>
        <h2 class="title is-4">History</h2>
        <p class="subtitle">
            <span v-if="isLoading">Fetching results...</span>
            <template v-else>
                <span>Fetched {{ infractions.length || 0 }} results. </span>
                <span v-if="isFiltersActive">Showing {{ filteredData.length }} filtered results.</span>
            </template>
        </p>

        <b-field grouped>
            <p class="control">
                <b-dropdown v-model="fetchBy.selected">
                    <button class="button is-info" type="button" slot="trigger">
                        <span>Fetch {{ fetchBy.selected }}</span>
                        <b-icon icon="menu-down"/>
                    </button>
                    <b-dropdown-item value='Recent'>
                        <h3 class="has-text-weight-bold">Recent</h3>
                        <p>Get recent infractions (default)</p>
                    </b-dropdown-item>
                    <b-dropdown-item value='by Steam ID'>
                        <h3 class="has-text-weight-bold">Steam ID</h3>
                        <p>Get all infractions by a perpetator's Steam ID</p>
                    </b-dropdown-item>
                    <b-dropdown-item value='by Admin'>
                        <h3 class="has-text-weight-bold">Admin</h3>
                        <p>Get all infractions from an admin</p>
                    </b-dropdown-item>
                    <b-dropdown-item value='by Date'>
                        <h3 class="has-text-weight-bold">Date</h3>
                        <p>Get all infractions on a date</p>
                    </b-dropdown-item>
                </b-dropdown>
            </p>
            <p class="control" v-show="fetchBy.selected !== 'Recent' || isFiltersActive">
                <button @click="setFetchByToQuery();setFiltersToQuery()" class="button" title="Reset fetchBy and filters.">Reset All</button>
            </p>
        </b-field>

        <div v-show="fetchBy.selected === 'by Steam ID'" class="box">
            <label class="label">Fetch by perpetrator's Steam ID:</label>
            <b-field addons>
                <b-input @keypress.enter.native="handleFetchBySteamID()" v-model.trim="fetchBy.steamid" 
                    expanded placeholder="SteamID/Profile ID" spellcheck="off"/>
                <p class="control">
                    <button @click="handleFetchBySteamID()" class="button is-rounded is-info">Fetch</button>
                </p>
            </b-field>
            <p>Or choose a player <a @click="searchModalActive = true" tabindex="0" role="button">from a list</a>.</p>
        </div>
        <player-search-modal :active="searchModalActive" @steamid="handleSearchByList" @close="searchModalActive = false"/>
        <div v-show="fetchBy.selected === 'by Admin'" class="box">
            <b-field label="Fetch by Admin:">
                <b-select placeholder="Select an Admin..." v-model="fetchBy.admin">
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
            <b-field label="View infractions from/to this admin?">
                <div class="block">
                    <b-radio 
                        v-for="(option, index) of ['from', 'to']" 
                        :key="index"
                        v-model="fetchBy.adminFromTo"
                        :native-value="option"
                        >
                        {{ option }}
                    </b-radio>
                </div>
            </b-field>
            <button @click="handleFetchByAdmin()" class="button is-info">Fetch</button>
        </div>
        <div v-show="fetchBy.selected === 'by Date'" class="box">
            <label class="label">Fetch infractions by date:</label>
            <b-field>
                <b-input type="date" v-model="fetchBy.date" icon="calendar-today" rounded/>
                <p class="control">
                    <button @click="handleFetchByDate()" class="button is-rounded is-info">Fetch</button>
                </p>
            </b-field>
        </div>


        <loading-box :active="isLoading"/>
        <div v-show="!isLoading && (!infractions.length || !filteredData.length)" class="message">
            <div class="message-body">
                <span v-if="!infractions.length">There are no results. :(</span>
                <span v-else-if="infractions.length && !filteredData.length">There are results, but they are filtered out. Try removing some filters. :(</span>
            </div>
        </div>

        <div class="table-spacer">
            <b-table
                v-if="filteredData.length"
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
                    <b-table-column field="perpnick" label="Player" width="300" class="nowrap" sortable>
                        <router-link 
                            :to="{ name: 'player-summary', 
                                params: { steamId64: steamId32toSteamId64(props.row.perpsteamid) }}"
                            title="View player info.">
                            {{ props.row.perpnick }}
                        </router-link>
                    </b-table-column>
                    <b-table-column field="unbanremaining" label="Unban" class="nowrap" sortable>
                        {{ formatUnbanText(props.row) }}
                    </b-table-column>
                    <b-table-column field="date" label="Date" class="nowrap" width="200" sortable>
                        {{ props.row.date }}
                    </b-table-column>
                    <b-table-column field="type" label="Type" width="70" class="nowrap" sortable>
                        <b-icon v-if="props.row.type === 'ban'" icon="gavel" type="is-danger" />
                        <b-icon v-if="props.row.type === 'kick'" icon="logout" type="is-info" />
                        <b-icon v-if="props.row.type === 'warning'" icon="alert" />
                        {{ shortenTypeName(props.row.type) }}
                    </b-table-column>
                    <b-table-column field="cluster" label="Mode" width="20" class="nowrap" sortable>
                        {{ shortenClusterName(props.row.cluster) }}
                    </b-table-column>
                    <b-table-column field="admin" label="Admin" width="300" class="nowrap" sortable>
                        <router-link 
                            v-if="!nonPlayerAdmins.includes(props.row.adminsteamid)"
                            :to="{ name: 'player-summary', 
                                params: { steamId64: steamId32toSteamId64(props.row.adminsteamid) }}"
                            title="View player info.">
                            {{ props.row.adminnick }}
                        </router-link>
                        <template v-else>{{ props.row.adminnick }}</template>
                    </b-table-column>
                </template>
                <template slot="detail" slot-scope="props">
                    <div class="content">
                        <p>
                            <strong>Reason: </strong>{{ props.row.reason }}<br>
                            <a :href="`https://devinity.org/pages/banscontrol/?banid=${props.row.id}`" target="_blank">Bans CP</a>
                        </p>
                    </div>
                </template>
            </b-table>
        </div>

        <b-field>
            <div class="block">
                <b-switch v-model="activeFilters.useCurrentAdminNames">Use current admin names</b-switch>
            </div>
        </b-field>
        <b-field>
            <div class="block">
                <b-switch v-model="activeFilters.hideAntiCheat">Hide infractions from Anti-Cheat</b-switch>
            </div>
        </b-field>
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
        <label class="label">Filter by Date:</label>
        <b-field>
            <b-checkbox v-model="activeFilters.dateEnabled"/>
            <b-input type="date" v-model="activeFilters.date" icon="calendar-today" rounded/>
        </b-field>
    </div>
</template>

<script>
import Clone from 'clone'
import PlayerSearchModal from '@/components/PlayerSearchModal'
import { apiDevinityPath, steamId32toSteamId64 } from '@/config'

const apiInfractionsPath = apiDevinityPath + 'infractions'

export default {
    components: {
        PlayerSearchModal
    },
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
                dateEnabled: false,
                date: '',
                hideAntiCheat: false,
                server: 0,
                type: 0,
                unban: 0,
                useCurrentAdminNames: false
            },
            adminDropdown: [],
            fetchBy: {
                admin: null,
                adminFromTo: 'from',
                date: null,
                selected: 'Recent',
                steamid: null
            },
            searchModalActive: false,
            nonPlayerAdmins: ['Anti-Cheat', 'VoteKick']
        }
    },
    methods: {
        steamId32toSteamId64,
        async getInfractions() {
            this.isLoading = true
            this.infractions = []
            let r = await this.$http(apiInfractionsPath)
            this.infractions = r.data
            this.isLoading = false
        },
        async getAdminList() {
            let r = await this.$http(apiInfractionsPath + '/getAllStaff')
            this.adminDropdown = r.data
        },
        async handleFetchByAdmin() {
            let fetchBy = `admin.${this.fetchBy.admin}`
            if (this.fetchBy.adminFromTo === 'to') fetchBy += `.to`
            this.setFetchByToQuery(fetchBy)
            this.isLoading = true
            this.infractions = []
            let endpoint = this.fetchBy.adminFromTo === 'from' ? '/byAdmin/' : '/bySteamId/'
            let r = await this.$http(apiInfractionsPath + endpoint + this.fetchBy.admin)
            this.infractions = r.data
            this.isLoading = false
        },
        async handleFetchBySteamID() {
            this.setFetchByToQuery(`steamid.${this.fetchBy.steamid}`)
            this.isLoading = true
            this.infractions = []
            let r = await this.$http(apiInfractionsPath + '/bySteamId/' + this.fetchBy.steamid)
            this.infractions = r.data
            this.isLoading = false
        },
        async handleFetchByDate() {
            this.setFetchByToQuery(`date.${this.fetchBy.date}`)
            this.isLoading = true
            this.infractions = []
            let r = await this.$http(apiInfractionsPath + '/byDate/' + this.fetchBy.date)
            this.infractions = r.data
            this.isLoading = false
        },
        handleSearchByList(steamid) {
            this.searchModalActive = false
            this.fetchBy.steamid = steamid
            this.handleFetchBySteamID()
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
        filterHideAntiCheat(row) {
            if (this.activeFilters.hideAntiCheat === false) return true
            else return row.adminsteamid !== this.nonPlayerAdmins[0]
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
        },
        filterByDate(row) {
            if (this.activeFilters.dateEnabled === false) return true
            else return row.date.substring(0, 10) === this.activeFilters.date
        },
        setCurrentDate() {
            const zeroPad = number => number < 10 ? '0' + number : number
            let currentDate = new Date(),
                year = currentDate.getFullYear(),
                month = zeroPad(currentDate.getMonth() + 1),
                day = zeroPad(currentDate.getDate())
            return [year, month, day].join('-')
        },
        applyFetchByFromQuery() {
            if (!this.$route.query.fetch) return
            let query = this.$route.query.fetch.split('.')
            if (query[0] === 'steamid') {
                this.fetchBy.selected = 'by Steam ID'
                this.fetchBy.steamid = query[1]
                this.handleFetchBySteamID()
            } else if (query[0] === 'admin') {
                this.fetchBy.selected = 'by Admin'
                this.fetchBy.admin = query[1]
                this.fetchBy.adminFromTo = query[2] === 'to' ? 'to' : 'from'
                this.handleFetchByAdmin()
            } else if (query[0] === 'date') {
                this.fetchBy.selected = 'by Date'
                this.fetchBy.date = query[1]
                this.handleFetchByDate()
            }
        },
        setFetchByToQuery(fetchBy) {
            let newQuery = {...this.$route.query }
            if (fetchBy) newQuery.fetch = fetchBy
            else delete newQuery.fetch
            this.$router.replace({ name: this.$route.name, query: { ...newQuery } })
            if (!fetchBy) this.fetchBy.selected = 'Recent'
        },
        applyFiltersFromQuery() {
            if (!this.$route.query.filters) return
            let filters = this.$route.query.filters.split('...')
            filters = filters.map(v => v.split('.'))
            filters.forEach(v => {
                if (v[0] === 'unban') {
                    this.activeFilters.unban = this.filters.unban.findIndex(el => el.toLowerCase() === v[1])
                } else if (v[0] === 'type') {
                    this.activeFilters.type = this.filters.type.findIndex(el => el.toLowerCase() === v[1])
                } else if (v[0] === 'mode') {
                    this.activeFilters.server = this.filters.server.findIndex(el => 
                        el.toLowerCase().replace(/[^a-z]/, '') === v[1])
                } else if (v[0] === 'date') {
                    this.activeFilters.dateEnabled = true
                    this.activeFilters.date = v[1]
                } else if (v[0] === 'hideanticheat') {
                    this.activeFilters.hideAntiCheat = true
                } else if (v[0] === 'usecurrentadminnames') {
                    this.activeFilters.useCurrentAdminNames = true
                }
            })
        },
        setFiltersToQuery(filters) {
            let newQuery = { ...this.$route.query }
            if (filters) newQuery.filters = filters
            else delete newQuery.filters
            this.$router.replace({ name: this.$route.name, query: { ...newQuery } })
            if (!filters) {
                this.activeFilters.server = this.activeFilters.type = this.activeFilters.unban = 0
                this.activeFilters.useCurrentAdminNames = this.activeFilters.hideAntiCheat = this.activeFilters.dateEnabled = false
            }
        }
    },
    computed: {
        filteredData() {
            if (!this.currentAdminNames) return []
            return this.currentAdminNames.filter(val => 
                this.filterByUnbanTime(val) 
                && this.filterHideAntiCheat(val)
                && this.filterByType(val)
                && this.filterByServer(val)
                && this.filterByDate(val)
            )
        },
        currentAdminNames() {
            let infractions = Clone(this.infractions, false)
            if (this.activeFilters.useCurrentAdminNames === false) {
                return infractions
            } 
            else {
                return infractions.map(infraction => {
                    let currentAdmin = this.adminDropdown.find(admin => admin.steamid === infraction.adminsteamid)
                    infraction.adminnick = currentAdmin ? currentAdmin.nick : infraction.adminnick
                    return infraction
                })
            }
        },
        isFiltersActive() {
            let { hideAntiCheat, useCurrentAdminNames, server, type, unban } = this.activeFilters
            return hideAntiCheat || useCurrentAdminNames || server || type || unban
        },
        buildQueryForFilters() {
            let query = []
            if (this.activeFilters.unban !== 0) 
                query.push(`unban.${this.filters.unban[this.activeFilters.unban].toLowerCase()}`)
            if (this.activeFilters.type !== 0) 
                query.push(`type.${this.filters.type[this.activeFilters.type].toLowerCase()}`)
            if (this.activeFilters.server !== 0) 
                query.push(`server.${this.filters.server[this.activeFilters.server].toLowerCase().replace(' ', '')}`)
            if (this.activeFilters.dateEnabled === true && this.activeFilters.date.length === 10)
                query.push(`date.${this.activeFilters.date}`)
            if (this.activeFilters.useCurrentAdminNames === true) 
                query.push('usecurrentadminnames')
            if (this.activeFilters.hideAntiCheat === true) 
                query.push('hideanticheat')
            return query.join('...')
        }
    },
    created() {
        this.getAdminList()
        this.fetchBy.date = this.activeFilters.date = this.setCurrentDate()
        this.applyFetchByFromQuery()
        this.applyFiltersFromQuery()
        if (this.fetchBy.selected === 'Recent') this.getInfractions()
    },
    watch: {
        "fetchBy.selected"() {
            if (this.fetchBy.selected === 'Recent') {
                this.setFetchByToQuery()
                this.getInfractions()
            }
        },
        activeFilters: {
            deep: true,
            handler() {
                this.setFiltersToQuery(this.buildQueryForFilters)
            }
        }
    }

}
</script>

<style>
.history>.table-spacer {
    min-height: 400px;
}
.history .nowrap {
    white-space: nowrap;
}
</style>

