<template>
    <div class="achievements">
        <h2 class="title is-4">Achievements</h2>
        <p class="subtitle">Unlocked {{ unlocked }} out of {{ total }} achievements.</p>
        <div v-show="isLoading" class="notification">
            <p>Loading...</p>
            <b-loading :active="isLoading" :is-full-page="false"/>
        </div>
        <article class="media" v-for="achieve in data" :key="achieve.id">
            <div class="media-content">
                <strong>{{ achieve.name }}</strong>
                <div class="level is-marginless">
                    <div class="level-left">
                        <p>{{ achieve.hidden === true ? "Hidden achievement" : achieve.desc }}</p>
                    </div>
                    <div v-if="achieve.value != -1" class="level-right is-marginless has-text-right">
                        <p>{{ achieve.value }} of {{ achieve.goal }}</p>
                    </div>
                </div>
                <progress v-if="achieve.value != -1" class="progress" :value="achieve.value" :max="achieve.goal"></progress>
            </div>
            <div v-if="achieve.value == -1" class="media-right">
                <b-icon icon="check"/>
            </div>
        </article>
    </div>
</template>

<script>
import { apiPlayerPath, formatNumber } from '@/config'

export default {
    name: 'Achievements',
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
            this.$http.get(apiPlayerPath + this.$route.params.steamId64 + '/floodAchievements')
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
            
        }
    },
    created() {
        this.getData()
    },
    computed: {
        unlocked() {
            return this.data.filter(val => val.value === -1).length
        },
        total() {
            return this.data.length
        }
    }
}
</script>