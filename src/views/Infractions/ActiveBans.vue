<template>
    <div class="active-bans">
        <hr>
        <h2 class="title is-4">Active Bans</h2>
        <p class="subtitle">
            Showing the last 200 bans.
            <span v-if="activeFilters.hideAntiCheat || activeFilters.unban">{{ filteredData.length }} filtered results.</span>
        </p>
        <loading-box :active="isLoading"/>
        <b-table
            v-if="bans.length"
            :data="filteredData"
            :mobile-cards="false"
            :paginated="true"
            :per-page="10"
            :narrowed="true"
            :default-sort="['date', 'desc']"
            default-sort-direction="desc"
            detailed
            detail-key="steamid"
            hoverable>
            <template slot-scope="props">
                <b-table-column field="name" label="Player" width="300" sortable>
                    <router-link 
                        :to="{ name: 'player-summary', 
                            params: { steamId64: steamId32toSteamId64(props.row.steamid) }}"
                        title="View player info.">
                        {{ props.row.name }}
                    </router-link>
                </b-table-column>
                <b-table-column field="unban" label="Unban in" sortable>
                    {{ props.row.unbanremaining ? props.row.unbanremaining : 'Permanent' }}
                </b-table-column>
                <b-table-column field="date" label="Date" class="nowrap" sortable>
                    {{ props.row.date }}
                </b-table-column>
                <b-table-column field="admin" label="Admin" width="300" sortable>
                    <router-link 
                        v-if="isAdminPlayer(props.row.admin)"
                        :to="{ name: 'player-summary', 
                            params: { steamId64: steamId32toSteamId64(getAdminSteamId(props.row.admin)) }}"
                        title="View player info.">
                        {{ formatAdminName(props.row.admin) }}
                    </router-link>
                    <template v-else>{{ props.row.admin }}</template>
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
                <b-switch v-model="activeFilters.hideAntiCheat">Hide bans from Anti-Cheat</b-switch>
            </div>
        </b-field>
        
    </div>
</template>


<script>
import { apiDevinityPath, steamId32toSteamId64 } from '@/config'

export default {
    data() {
        return {
            bans: [],
            isLoading: false,
            filters: {
                unban: ['All', 'Permanent', 'Timed']
            },
            activeFilters: {
                hideAntiCheat: false,
                unban: 0
            }
        }
    },
    methods: {
        steamId32toSteamId64,
        async getBans() {
            this.isLoading = true
            let r = await this.$http(apiDevinityPath + 'activeBans')
            this.bans = r.data
            this.isLoading = false
        },
        formatAdminName(admin) {
            return admin.substring(0, admin.indexOf('(STEAM_0:'))
        },
        isAdminPlayer(admin) {
            return !['(Console)', 'Anti-Cheat'].includes(admin)
        },
        getAdminSteamId(admin) {
            return admin.substring(admin.indexOf('(STEAM_0:') + 1, admin.length - 1)
        },
        filterByUnbanTime(unban) {
            if (this.activeFilters.unban === 0) return true
            else if (this.activeFilters.unban === 1) return unban === 0
            else return unban !== 0
        },
        filterHideAntiCheat(admin) {
            if (this.activeFilters.hideAntiCheat === false) return true
            else return admin !== 'Anti-Cheat'
        }
    },
    computed: {
        filteredData() {
            let data = null
            data = this.bans.filter(val => this.filterByUnbanTime(val.unban) && this.filterHideAntiCheat(val.admin))
            return data
        }
    },
    created() {
        this.getBans();
    }
}
</script>

<style>
.active-bans .nowrap {
    white-space: nowrap;
}
</style>
