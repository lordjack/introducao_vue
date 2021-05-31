<template>
  <div class="hello">
    <h1>Olá {{ msg }}</h1>

    <div style="height: 500px; width: 100%">
      <div style="height: 200px; overflow: auto">
        <h1>
          teste 02
          <!-- {{  pOverlay */ }} -->
        </h1>
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

export default {
  name: "PixiOverlayTeste2",
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
      // exemplo com marcador

      function getRandom(min, max) {
        return min + Math.random() * (max - min);
      }
      var markersLength = 10;

      let loader = new PIXI.Loader();
      //C:\laragon\www\projetos\introducao_vue\src\components\PixiOverlayTeste2.vue
      //https://icons-for-free.com/iconfiles/png/512/marker-131994967950423839.png
      loader.add("marker", "https://pixijs.io/examples/examples/assets/bunny.png");

      loader.load((loader, resources) => {
        let texture = resources.marker.texture;
        let markerLatLng = [47.405437, -1.23373];
        let marker = new PIXI.Sprite(texture);
        marker.anchor.set(0.5, 1);

        let pixiContainer = new PIXI.Container();
        // pixiContainer.addChild(marker);
        var innerContainer = new PIXI.particles.ParticleContainer(markersLength, {
          vertices: true,
        });
        innerContainer.texture = texture;
        innerContainer.baseTexture = texture.baseTexture;
        innerContainer.anchor = { x: 0.5, y: 1 };

        pixiContainer.addChild(innerContainer);

        let firstDraw = true;
        let prevZoom;
        var initialScale;
        let pixiOverlay = L.pixiOverlay((utils, event) => {
          let zoom = utils.getMap().getZoom();
          let container = utils.getContainer();
          let renderer = utils.getRenderer();
          let project = utils.latLngToLayerPoint;
          let scale = utils.getScale();

          if (event.type === "add") {
            var origin = project([(48.7 + 49) / 2, (2.2 + 2.8) / 2]);
            innerContainer.x = origin.x;
            innerContainer.y = origin.y;
            initialScale = scale / 8;
            innerContainer.localScale = initialScale;
            for (var i = 0; i < markersLength; i++) {
              var coords = project([getRandom(48.7, 49), getRandom(2.2, 2.8)]);
              // our patched particleContainer accepts simple {x: ..., y: ...} objects as children:
              innerContainer.addChild({
                x: coords.x - origin.x,
                y: coords.y - origin.y,
              });
            }
          }
          /* if (event.type === "zoomanim") {
            var targetZoom = event.zoom;
            if (targetZoom >= 16 || zoom >= 16) {
              zoomChangeTs = 0;
              var targetScale =
                targetZoom >= 16 ? 1 / getScale(event.zoom) : initialScale;
              innerContainer.currentScale = innerContainer.localScale;
              innerContainer.targetScale = targetScale;
            }
            return;
          } */

          if (firstDraw) {
            let markerCoords = project(markerLatLng);
            marker.x = markerCoords.x;
            marker.y = markerCoords.y;
          }

          if (firstDraw || prevZoom !== zoom) {
            marker.scale.set(1 / scale);
          }

          firstDraw = true;
          prevZoom = zoom;
          renderer.render(container);
        }, pixiContainer);
        pixiOverlay.addTo(this.$refs.map.mapObject);
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
