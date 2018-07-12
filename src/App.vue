<template>
  <div id="app">
    <notifications classes="notification" :speed="200"/>
    <router-view/>
  </div>
</template>

<script>
import Quicksand from 'typeface-quicksand'

export default {
  metaInfo: {
    title: 'Home',
    titleTemplate: '%s - Devinity Dashboard'
  }
}
</script>


<style lang="scss">
@import 'assets/style.scss';
</style>
