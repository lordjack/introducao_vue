<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <PixiOverlay msg="PixiOverlay"/>
  </div>
</template>

<script>
//import HelloWorld from './components/HelloWorld.vue'
import PixiOverlay from './components/PixiOverlay.vue'

export default {
  name: 'App',
  components: {
    PixiOverlay
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
