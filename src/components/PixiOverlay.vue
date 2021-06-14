<template>
  <div class="hello">
    <h1>Olá {{ msg }}</h1>

    <div style="height: 500px; width: 100%">
      <div style="height: 200px; overflow: auto">
        <h1>
          teste1
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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
                sed pretium nisl, ut sagittis sapien. Sed vel sollicitudin nisi.
                Donec finibus semper metus id malesuada.
              </p>
            </div>
          </l-popup>
        </l-marker>
        <l-marker :lat-lng="withTooltip">
          <l-tooltip :options="{ permanent: true, interactive: true }">
            <div @click="innerClick">
              Eu sou um teste
              <p v-show="showParagraph">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
                sed pretium nisl, ut sagittis sapien. Sed vel sollicitudin nisi.
                Donec finibus semper metus id malesuada.
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
import L, { latLng } from 'leaflet';
import * as PIXI from 'pixi.js';
import 'leaflet-pixi-overlay';
import { LMap, LTileLayer, LMarker, LPopup, LTooltip } from 'vue2-leaflet';
import 'leaflet/dist/leaflet.css';

// Resolve problem from default icons (net::ERR_INVALID_URL)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default {
  name: 'PixiOverlay',
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
      map: null,
      zoom: 13,
      center: latLng(51.509, -0.08),
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      withPopup: latLng(47.41322, -1.219482),
      withTooltip: latLng(47.41422, -1.250482),
      currentZoom: 11.5,
      currentCenter: latLng(-0.08, 51.509),
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.5,
      },
      showMap: true,
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
      alert('Click!');
    },

    draw() {
      // exemplo com poligonos

      var polygonLatLngs = [
        [51.509, -0.08],
        [51.503, -0.06],
        [51.51, -0.047],
        [51.509, -0.08],
      ];
      var projectedPolygon;
      var triangle = new PIXI.Graphics();

      var pixiContainer = new PIXI.Container();
      pixiContainer.addChild(triangle);

      var firstDraw = true;
      var prevZoom;

      var pixiOverlay = L.pixiOverlay(function (utils) {
        var zoom = utils.getMap().getZoom();
        var container = utils.getContainer();
        var renderer = utils.getRenderer();
        var project = utils.latLngToLayerPoint;
        var scale = utils.getScale();

        if (firstDraw) {
          projectedPolygon = polygonLatLngs.map(function(coords) {
            return project(coords);
          });
        }
        if (firstDraw || prevZoom !== zoom) {
          triangle.clear();
          triangle.lineStyle(3 / scale, 0x3388ff, 1);
          triangle.beginFill(0x3388ff, 0.2);
          projectedPolygon.forEach(function(coords, index) {
            if (index == 0) triangle.moveTo(coords.x, coords.y);
            else triangle.lineTo(coords.x, coords.y);
          });
          triangle.endFill();
        }
        firstDraw = false;
        prevZoom = zoom;
        renderer.render(container);
      }, pixiContainer);

      this.map.addLayer(pixiOverlay);
    },
  },
  async mounted() {
    try {
      await this.$nextTick(async () => {
        this.map = this.$refs.map.mapObject;
        this.draw();
      });
    } catch (err) {
      console.log(err);
    }
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
