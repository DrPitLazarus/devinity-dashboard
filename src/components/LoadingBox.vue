<template>
    <div class="loading-box">
        <div class="notification" v-show="active">
            <p>Loading...</p>
            <b-loading :active="active" :is-full-page="false"/>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LoadingBox',
    props: {
        active: Boolean
    }
}
</script>
