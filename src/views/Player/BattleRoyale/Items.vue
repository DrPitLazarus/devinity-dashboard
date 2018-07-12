<template>
    <div class="owned-weapons">
        <h2 class="title is-4">Items</h2>
        <b-table
            :data="data"
            :default-sort="['item', 'asc']"
            :loading="isLoading"
            hoverable>

            <template slot-scope="props">
                <b-table-column field="item" label="Name" sortable>
                    {{ props.row.item }}
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
                this.data = res.body
                this.isLoading = false
            })
            .catch(err => {
                console.log(err)
                this.$notify({
                    text: `Could not get battleroyaleItems. (Status ${err.status})`,
                    type: 'is-danger'
                })
                this.isLoading = false
            })
            
        }
    },
    created() {
        this.getData()
    }
}
</script>
