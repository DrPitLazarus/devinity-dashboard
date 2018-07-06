<template>
  <div id="app">
    <notifications classes="notification" :speed="200"/>
    <router-view/>
  </div>
</template>

<script>
import Quicksand from 'typeface-quicksand'

export default {}
</script>


<style lang="scss">
@import 'assets/style.scss';
</style>
