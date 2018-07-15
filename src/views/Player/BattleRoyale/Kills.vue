<template>
    <div class="kills">
        <h2 class="title is-4">Kills</h2>
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
                            <p class="heading is-size-6">Total Kills</p>
                            <p class="title">{{ data.killSummary.kills }}</p>
                        </div>
                    </div>
                    <div class="level-item has-text-centered">
                        <div>
                            <p class="heading is-size-6">By Headshot</p>
                            <p class="title">{{ data.killSummary.headshots }}</p>
                        </div>
                    </div>
            </div>
            <h3 class="title is-5">Kills by Player</h3>
            <b-table
                :data="data.playersKilled"
                :default-sort="['victimcount', 'desc']"
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
                    <b-table-column field="victimcount" label="Kills" width="20" sortable numeric :custom-sort="victimcountSort">
                        {{ props.row.victimcount }}
                    </b-table-column>
                </template>
            </b-table>

            <h3 class="title is-5">Kills by Weapon</h3>
            <b-table
                :data="data.weaponsKills"
                :default-sort="['wepcount', 'desc']"
                default-sort-direction="desc"
                :mobile-cards="false"
                :paginated="true"
                :per-page="5"
                :pagination-simple="true"
                hoverable>

                <template slot-scope="props">
                    <b-table-column field="nick" label="Player" sortable>
                        {{ props.row.name }}
                    </b-table-column>
                    <b-table-column field="headshots" label="Headshots" width="20" sortable numeric :custom-sort="headshotsSort">
                        {{ props.row.headshots }}
                    </b-table-column>
                    <b-table-column field="wepcount" label="Kills" width="20" sortable numeric :custom-sort="wepcountSort">
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
    name: 'Kills',
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
                this.$http(apiPath + 'KillSummary'),
                this.$http(apiPath + 'PlayersKilled'),
                this.$http(apiPath + 'WeaponsKills')
            ]).then(this.$http.spread((summary, players, weapons) => {
                this.$set(this.data, 'killSummary', summary.data[0])
                this.$set(this.data, 'playersKilled', players.data)
                this.$set(this.data, 'weaponsKills', weapons.data)
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
        victimcountSort(a, b, isAsc) {
            return this.numberSort(a, b, isAsc, 'victimcount')
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
            return !this.isLoading && this.data.killSummary.kills != 0
        },
        dataLoadedAndEmpty() {
            return !this.isLoading && this.data.killSummary.kills == 0
        }
    }
}
</script>
