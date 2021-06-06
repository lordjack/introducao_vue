<template>
  <div class="hello">
    <h1>Olá {{ msg }}</h1>

    <div style="height: 500px; width: 100%">
      <div style="height: 200px; overflow: auto">
        <h1>teste6</h1>
        <p>Marcação lugar no Mapa {{ withPopup.lat }}, {{ withPopup.lng }}</p>
        <p>Centro {{ currentCenter }} o zoom é: {{ currentZoom }}</p>
        <button @click="showLongText">Teste</button>
        <button @click="showMap = !showMap">Mostrar/Ocutar</button>
      </div>
      <l-map
        ref="map"
        v-if="showMap"
        :zoom="zoom"
        :center="center"
        :options="mapOptions"
        style="height: 90%"
        @update:center="centerUpdate"
        @update:zoom="zoomUpdate"
      >
        <l-tile-layer :url="url" :attribution="attribution" />
        <l-marker :lat-lng="withPopup">
          <l-popup>
            <div @click="innerClick">
              I am a popup
              <p v-show="showParagraph">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed
                pretium nisl, ut sagittis sapien. Sed vel sollicitudin nisi. Donec finibus
                semper metus id malesuada.
              </p>
            </div>
          </l-popup>
        </l-marker>
        <l-marker :lat-lng="withTooltip">
          <l-tooltip :options="{ permanent: true, interactive: true }">
            <div @click="innerClick">
              Eu sou um teste
              <p v-show="showParagraph">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed
                pretium nisl, ut sagittis sapien. Sed vel sollicitudin nisi. Donec finibus
                semper metus id malesuada.
              </p>
            </div>
          </l-tooltip>
        </l-marker>
      </l-map>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import L, { latLng } from "leaflet";
import { LMap, LTileLayer, LMarker, LPopup, LTooltip } from "vue2-leaflet";
import * as PIXI from "pixi.js";
import "leaflet/dist/leaflet.css";
import "leaflet-pixi-overlay";
import "../assets/js/tools.min.js";
import * as d3 from "d3";
//import json from "./data/communes.json";
import axios from "axios";

export default {
  name: "PixiOverlayTeste6",
  props: {
    msg: String,
  },
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip,
  },
  data() {
    return {
      zoom: 13,
      center: latLng(47.41322, -1.219482),
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      withPopup: latLng(47.41322, -1.219482),
      withTooltip: latLng(47.41422, -1.250482),
      currentZoom: 11.5,
      currentCenter: latLng(47.41322, -1.219482),
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.5,
      },
      showMap: true,
      map: null,
      info: null,
    };
  },
  methods: {
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    showLongText() {
      this.showParagraph = !this.showParagraph;
    },
    innerClick() {
      alert("Click!");
    },

    draw() {
      var loader = new PIXI.loaders.Loader();
      loader
        .add("plane", "../assets/img/plane.png")
        .add("bicycle", "../assets/img/bicycle.png");

      loader.load(async (loader, resources) => {
        var textures = [resources.plane.texture, resources.bicycle.texture];

        const response = await axios.get("data/cities.json");
        var markers = response.data;

        var vm = this;
        vm.map.attributionControl.setPosition("bottomleft");
        vm.map.zoomControl.setPosition("bottomright");

        var pixiContainer = new PIXI.Container();
        var markerSprites = [];
        var previousZoom = null;
        var colorScale = d3
          .scaleLinear()
          .domain([0, 50, 100])
          .range(["#c6233c", "#ffd300", "#008000"]);
        var doubleBuffering =
          /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        var pixiOverlay = L.pixiOverlay(
          (utils, event) => {
            var zoom = utils.getMap().getZoom();
            var container = utils.getContainer();
            var renderer = utils.getRenderer();
            var project = utils.latLngToLayerPoint;
            var scale = utils.getScale();
            var invScale = 1 / scale;
            //   markerSprites.map((markerSprite) => {
            if (event.type === "add") {
              // markers.forEach(function (marker) {
              markers.map((marker) => {
                var coords = project([marker.latitude, marker.longitude]);
                var index = Math.floor(Math.random() * textures.length);
                var markerSprite = new PIXI.Sprite(textures[index]);
                markerSprite.textureIndex = index;
                markerSprite.x = coords.x;
                markerSprite.y = coords.y;
                markerSprite.anchor.set(0.5, 0.5);
                markerSprite.scale.set(invScale);
                var tint = d3.color(colorScale(Math.random() * 100)).rgb();
                markerSprite.tint = 256 * (tint.r * 256 + tint.g) + tint.b;
                container.addChild(markerSprite);
                markerSprites.push(markerSprite);
              });
            }

            if (event.type === "moveend" && previousZoom !== zoom) {
              markerSprites.map((markerSprite) => {
                //  markerSprites.forEach(function (markerSprite) {
                markerSprite.scale.set(invScale);
              });
              previousZoom = zoom;
            }

            if (event.type === "redraw") {
              var delta = event.delta;
              markerSprites.map((markerSprite) => {
                // markerSprites.forEach(function (markerSprite) {
                markerSprite.rotation -= 0.03 * delta;
              });
            }
            renderer.render(container);
          },
          pixiContainer,
          {
            doubleBuffering: doubleBuffering,
          }
        );
        //      };
        //adiciona a sobreposição no mapa de referencia
        pixiOverlay.addTo(this.$refs.map.mapObject);

        var ticker = new PIXI.ticker.Ticker();
        ticker.add(function (delta) {
          pixiOverlay.redraw({ type: "redraw", delta: delta });
        });
        ticker.start();
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.map = this.$refs.map.mapObject; // work as expected
    });
    this.draw();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
