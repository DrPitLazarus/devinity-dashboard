<template>
    <div class="owned-weapons">
        <h2 class="title is-4">Owned Weapons</h2>
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
            :default-sort="['name', 'asc']"
            :mobile-cards="false"
            hoverable>

            <template slot-scope="props">
                <b-table-column field="name" label="Name" sortable>
                    {{ props.row.name }}
                </b-table-column>
                <b-table-column field="price" label="Price" sortable numeric :custom-sort="priceSort">
                    &dollar;{{ formatNumber(fixNumber(props.row.price)) }}
                </b-table-column>
                <b-table-column field="holstered" label="Holstered?" sortable numeric>
                    <b-icon icon="check" v-if="props.row.holstered == 1"></b-icon>
                </b-table-column>
            </template>
        </b-table>
    </div>
</template>

<script>
import { apiPlayerPath, formatNumber } from '@/config'

export default {
    name: 'OwnedWeapons',
    data() {
        return {
            data: [],
            isLoading: false
        }
    },
    methods: {
        formatNumber,
        fixNumber(num) {
            if (!num) return
            return parseInt(num) <= 0 ? "0" : num
        },
        getFavoriteWeapons() {
            this.isLoading = true
            this.$http.get(apiPlayerPath + this.$route.params.steamId64 + '/floodOwnedWeapons')
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
        priceSort(a, b, isAsc) {
            return this.numberSort(a, b, isAsc, 'price')
        },
    },
    created() {
        this.getFavoriteWeapons()
    }
}
</script>
