<template>
    <div class="deaths">
        <h2 class="title is-4">Deaths</h2>
        <div v-show="dataLoadedAndEmpty" class="message">
            <div class="message-body">
                There is nothing here. :(
            </div>
        </div>
        <div v-show="isLoading" class="notification">
            <p>Loading...</p>
            <b-loading :active="isLoading" :is-full-page="false"/>
        </div>
        <template v-if="dataLoadedAndNotEmpty">
            <div class="level">
                <div class="level-item has-text-centered">
                    <div>
                        <p class="heading is-size-6">Total Deaths</p>
                        <p class="title">{{ data.deathSummary.deaths }}</p>
                    </div>
                </div>
                <div class="level-item has-text-centered">
                    <div>
                        <p class="heading is-size-6">By Headshot</p>
                        <p class="title">{{ data.deathSummary.headshot }}</p>
                    </div>
                </div>
                <div class="level-item has-text-centered">
                    <div>
                        <p class="heading is-size-6">By Team</p>
                        <p class="title">{{ data.deathSummary.teamkill }}</p>
                    </div>
                </div>
                <div class="level-item has-text-centered">
                    <div>
                        <p class="heading is-size-6">By Sphere</p>
                        <p class="title">{{ data.deathSummary.spherekill }}</p>
                    </div>
                </div>
                <div class="level-item has-text-centered">
                    <div>
                        <p class="heading is-size-6">By World</p>
                        <p class="title">{{ data.deathSummary.worldkill }}</p>
                    </div>
                </div>
            </div>

            <h3 class="title is-5">Deaths by Player</h3>
            <b-table
                :data="data.playersKilledBy"
                :default-sort="['killercount', 'desc']"
                default-sort-direction="desc"
                :mobile-cards="false"
                :paginated="true"
                :per-page="5"
                :pagination-simple="true"
                hoverable>

                <template slot-scope="props">
                    <b-table-column field="nick" label="Player" sortable>
                        {{ props.row.nick }}
                    </b-table-column>
                    <b-table-column field="headshots" label="Headshots" width="20" sortable numeric :custom-sort="headshotsSort">
                        {{ props.row.headshots }}
                    </b-table-column>
                    <b-table-column field="killercount" label="Deaths" width="20" sortable numeric :custom-sort="killercountSort">
                        {{ props.row.killercount }}
                    </b-table-column>
                </template>
            </b-table>

            <h3 class="title is-5">Deaths by Weapon</h3>
            <b-table
                v-if="data.weaponsKilledBy"
                :data="data.weaponsKilledBy"
                :default-sort="['wepcount', 'desc']"
                default-sort-direction="desc"
                :loading="isLoading"
                :mobile-cards="false"
                :paginated="true"
                :per-page="5"
                :pagination-simple="true"
                hoverable>

                <template slot-scope="props">
                    <b-table-column field="name" label="Weapon" sortable>
                        {{ props.row.name }}
                    </b-table-column>
                    <b-table-column field="headshots" label="Headshots" width="20" sortable numeric :custom-sort="headshotsSort">
                        {{ props.row.headshots }}
                    </b-table-column>
                    <b-table-column field="wepcount" label="Deaths" width="20" sortable numeric :custom-sort="wepcountSort">
                        {{ props.row.wepcount }}
                    </b-table-column>
                </template>
            </b-table>
        </template>
    </div>
</template>

<script>
import { apiPlayerPath, formatNumber } from '@/config'

export default {
    name: 'Deaths',
    data() {
        return {
            data: {},
            isLoading: false
        }
    },
    methods: {
        formatNumber,
        getData() {
            this.isLoading = true
            let apiPath = apiPlayerPath + this.$route.params.steamId64 + '/battleroyale'
            this.$http.all([
                this.$http(apiPath + 'DeathSummary'),
                this.$http(apiPath + 'PlayersKilledBy'),
                this.$http(apiPath + 'WeaponsKilledBy')
            ]).then(this.$http.spread((summary, players, weapons) => {
                this.$set(this.data, 'deathSummary', summary.data[0])
                this.$set(this.data, 'playersKilledBy', players.data)
                this.$set(this.data, 'weaponsKilledBy', weapons.data)
                this.isLoading = false
            })).catch(err => this.$toast.open({
                duration: 7000,
                message: err.message,
                position: 'is-bottom',
                type: 'is-danger'
            }))
        },
        numberSort(a, b, isAsc, key) {
            return isAsc ? a[key] - b[key] : b[key] - a[key]
        },
        killercountSort(a, b, isAsc) {
            return this.numberSort(a, b, isAsc, 'killercount')
        },
        wepcountSort(a, b, isAsc) {
            return this.numberSort(a, b, isAsc, 'wepcount')
        },
        headshotsSort(a, b, isAsc) {
            return this.numberSort(a, b, isAsc, 'headshots')
        },
    },
    created() {
        this.getData()
    },
    computed: {
        dataLoadedAndNotEmpty() {
            return !this.isLoading && this.data.deathSummary.deaths != 0
        },
        dataLoadedAndEmpty() {
            return !this.isLoading && this.data.deathSummary.deaths == 0
        }
    }
    
}
</script>
