<template>
  <div id="app">
    <!-- <PixiOverlay msg="PixiOverlay"/>-->
    <div id="nav">
      <router-link to="/helloworld">Início</router-link> |
      <router-link to="/pixioverlay"> Exemplo Pixi Overlay |</router-link>
      <router-link to="/pixioverlayteste2">
        Exemplo Pixi Overlay Um Milhão de Marcações</router-link
      >
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
//import HelloWorld from './components/HelloWorld.vue'
//import PixiOverlay from './components/PixiOverlay.vue'

export default {
  name: "App",
  components: {
    // PixiOverlay,
    //  HelloWorld
  },
};
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
