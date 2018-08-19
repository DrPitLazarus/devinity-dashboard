<template>
    <div class="infractions">
        <section class="section">
            <div class="container">
                <h1 class="title is-unselectable">Devinity Infractions</h1>
                <p class="subtitle">Browse active and historic bans, kicks, and warnings given to players.</p>

                <router-tabs
                :tabs="routerTabs"
                :path-level="1"
                />

                <router-view/>
            </div>
        </section>
    </div>
</template>

<script>
import { apiDevinityPath } from '@/config'
import RouterTabs from '@/components/RouterTabs'

export default {
    metaInfo: {
        title: 'Infractions'
    },
    components: {
        RouterTabs
    },
    data() {
        return {
            routerTabs: [
                {
                    text: 'Active Bans',
                    to: {
                        name: 'infractions-activebans'
                    }
                },
                {
                    text: 'History',
                    to: {
                        name: 'infractions-history'
                    }
                }
            ]
        }
    }
}
</script>
