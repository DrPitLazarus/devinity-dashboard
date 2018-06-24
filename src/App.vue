<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { eventBus } from '@/main'

export default {
  mounted() {
    eventBus.addEventListener('copy-success', function (e) {
      console.log('event!!')
      console.log(e)
    })
  }
}
</script>


<style lang="scss">
@import 'assets/style.scss';
</style>
