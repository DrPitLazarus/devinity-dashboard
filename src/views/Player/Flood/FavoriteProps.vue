<template>
    <div class="favorite-props">
        <h2 class="title is-4">Favorite Props</h2>
        <p class="subtitle">Data gathered from the last 1,000 rounds this player played on.</p>
        <div v-show="!isLoading && data.length === 0" class="message">
            <div class="message-body">
                There is nothing here. :(
            </div>
        </div>
        <div v-show="isLoading" class="notification">
            <p>Loading...</p>
            <b-loading :active="isLoading" :is-full-page="false"/>
        </div>
        <b-table
            v-if="data.length"
            :data="data"
            :default-sort="['usecount', 'desc']"
            :loading="isLoading"
            hoverable>

            <template slot-scope="props">
                <b-table-column field="name" label="Name" sortable>
                    {{ props.row.name }}
                </b-table-column>
                <b-table-column field="usecount" label="Used" sortable numeric :custom-sort="usecountSort">
                    {{ formatNumber(props.row.usecount) }}
                </b-table-column>
            </template>
        </b-table>
    </div>
</template>

<script>
import { apiPlayerPath, formatNumber } from '@/config'

export default {
    name: 'FavoriteProps',
    data() {
        return {
            data: [],
            isLoading: false
        }
    },
    methods: {
        formatNumber,
        getFavoriteProps() {
            this.isLoading = true
            this.$http.get(apiPlayerPath + this.$route.params.steamId64 + '/floodFavoriteProps')
            .then(res => {
                this.data = res.data
                this.isLoading = false
            })
            .catch(err => {
                this.$toast.open({
                    duration: 7000,
                    message: err.message,
                    position: 'is-bottom',
                    type: 'is-danger'
                })
                this.isLoading = false
            })
            
        },
        numberSort(a, b, isAsc, key) {
            return isAsc ? a[key] - b[key] : b[key] - a[key]
        },
        usecountSort(a, b, isAsc) {
            return this.numberSort(a, b, isAsc, 'usecount')
        },
    },
    created() {
        this.getFavoriteProps()
    }
}
</script>
