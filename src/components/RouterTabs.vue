<template>
    <div class="router-tabs">
        <div class="field has-addons">
            <p 
                v-for="(tab, index) of tabs"
                :key="index"
                class="control">
                <router-link
                    @click.native="tabClick(index)"
                    :to="tab.to"
                    :class="{ 'is-active is-dark': activeTab == index }" 
                    class="button is-rounded">
                    {{ tab.text }}
                </router-link>
            </p>
        </div>
    </div>
</template>

<script>
let exampleTabsArray = [
    {
        text: 'Active Bans',
        to: {
            name: 'home'
        }
    }
]

export default {
    name: 'RouterTabs',
    props: {
        tabs: Array,
        pathLevel: Number,
        default: Boolean
    },
    data() {
        return {
            activeTab: -1
        }
    },
    methods: {
        tabClick(index) {
            this.$emit('click', index)
            this.setActiveTab(index)
        },
        setActiveTab(index) {
            this.activeTab = index
            this.$emit('change', index)
        },
        setActiveTabByRoute() {
            if (!this.$route.matched[this.pathLevel]) return this.setActiveTab(this.default === true ? 0 : -1)
            this.tabs.forEach((val, index) => {
                if (val.to.name === this.$route.matched[this.pathLevel].name) {
                    return this.setActiveTab(index)
                }
            })
        }
    },
    created() {
        this.setActiveTabByRoute()
    },
    watch: {
        "$route.name"() {
            this.setActiveTabByRoute()
        }
    }
}
</script>

<style scoped>
.router-tabs > .field {
    overflow: auto;
}
</style>
