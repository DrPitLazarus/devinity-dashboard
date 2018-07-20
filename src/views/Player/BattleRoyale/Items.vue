<template>
    <div class="owned-weapons">
        <h2 class="title is-4">Items</h2>
        <div v-show="!isLoading && data.length === 0" class="message">
            <div class="message-body">
                There is nothing here. :(
            </div>
        </div>
        <div v-show="isLoading" class="notification">
            <p>Loading...</p>
            <b-loading :active="isLoading" :is-full-page="false" animation="none"/>
        </div>
        <b-table
            v-if="data.length"
            :data="data"
            :default-sort="['item', 'asc']"
            :mobile-cards="false"
            hoverable>

            <template slot-scope="props">
                <b-table-column field="item" label="Name" sortable>
                    {{ formatName(props.row.item) }}
                </b-table-column>
                <b-table-column field="equipped" label="Equipped?" sortable numeric>
                    <b-icon icon="check" v-if="props.row.equipped == 1"></b-icon>
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
        getData() {
            this.isLoading = true
            this.$http.get(apiPlayerPath + this.$route.params.steamId64 + '/battleroyaleItems')
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
        formatName(text) {
            if (!text) return
            if (!text.includes('_')) {
                return text.charAt(0).toUpperCase() + text.substr(1)
            } else {
                text = text.split('_')
                return text[1].charAt(0).toUpperCase() + text[1].substring(1) + ` (${text[2]})`
            }
        }
    },
    created() {
        this.getData()
    }
}
</script>
