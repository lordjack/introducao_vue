<template>
  <div id="app">
    <!-- <PixiOverlay msg="PixiOverlay"/>-->
    <div id="nav">
      <router-link to="/helloworld">Início</router-link> |
      <router-link to="/pixioverlay"> Exemplo Pixi Overlay |</router-link>
      <router-link to="/pixioverlayteste2"> Exemplo 02 - Pixi Overlay | </router-link>
      <router-link to="/PixiOverlayTeste3"> Exemplo 03 - Pixi Overlay | </router-link>
      <router-link to="/PixiOverlayTeste4"> Exemplo 04 - Pixi Overlay | </router-link>
      <router-link to="/PixiOverlayTeste5"> Exemplo 05 - Cidade | </router-link>
      <router-link to="/PixiOverlayTeste6"> Exemplo 06 - Cidade | </router-link>
      <router-link to="/PixiOverlayTeste7"> Exemplo 07 - USA Markers | </router-link>
      <router-link to="/PixiOverlayTeste8"> Exemplo 08 - USA Polygonos| </router-link>
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
