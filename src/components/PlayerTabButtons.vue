<template>
    <div class="player-tab-buttons">
        <div class="field has-addons">
            <p 
                v-for="(button, index) of buttons"
                :key="index"
                class="control">
                <router-link
                    @click.native="buttonClick(index)"
                    :to="{ name: button.to, params: {steamId64, playerName}}"
                    :class="{ 'is-active is-dark': activeButton == index }" 
                    class="button is-rounded">
                    {{ button.title }}
                </router-link>
            </p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PlayerTabButtons',
    props: {
        steamId64: String,
        playerName: String,
        buttons: Array
    },
    data() {
        return {
            activeButton: -1
        }
    },
    methods: {
        buttonClick(value) {
            this.$emit('input', value)
            this.changeButton(value)
        },
        changeButton(value) {
            if (this.activeButton == value.index) return
            this.activeButton = value
            this.$emit('change', value)
        },
        setActiveButton(index) {
            this.activeButton = index
            this.$emit('change', index)
        },
        updateActiveButtonFromRoute() {
            let isFound = false
            this.buttons.forEach((val, index) => {
                if (val.to === this.$route.name) {
                    // console.log('matched', this.$route.name)
                    isFound = true
                    return this.setActiveButton(index)
                }
            })
            if (!isFound) {
                // console.log('oh no')
                this.buttons.forEach((val, index) => {
                    if (val.to === this.$route.matched[this.$route.matched.length - 2].name) {
                        // console.log('matched', val.to)
                        this.setActiveButton(index)
                    }
                })
            }
        }
    },
    mounted() {
        this.updateActiveButtonFromRoute()
    }
}
</script>

<style scoped>
.player-tab-buttons>.field {
    overflow: auto;
}
</style>
