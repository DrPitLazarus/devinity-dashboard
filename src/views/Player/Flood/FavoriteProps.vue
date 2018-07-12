<template>
    <div class="favorite-props">
        <h2 class="title is-4">Favorite Props</h2>
        <p class="subtitle">Data gathered from the last 1,000 rounds this player played on.</p>
        <b-table
            :data="favProps"
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
            favProps: [],
            isLoading: false
        }
    },
    methods: {
        formatNumber,
        getFavoriteProps() {
            this.isLoading = true
            this.$http.get(apiPlayerPath + this.$route.params.steamId64 + '/floodFavoriteProps')
            .then(res => {
                this.favProps = res.body
                this.isLoading = false
            })
            .catch(err => {
                console.log(err)
                this.$notify({
                    text: `Could not get floodFavoriteProps. (Status ${err.status})`,
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
