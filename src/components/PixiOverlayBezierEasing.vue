<template>
  <div class="hello">
    <h1>Olá {{ msg }}</h1>

    <div style="height: 500px; width: 100%">
      <div style="height: 200px; overflow: auto">
        <h1>
          PixiOverlayMarkers Page
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
        @update:bounds="boundsUpdate"
        @zoomstart="zoomStart"
        @zoomanim="pixiLayer.redraw, pixiLayer"
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
import { LMap, LTileLayer, LMarker, LPopup, LTooltip } from 'vue2-leaflet';
import * as PIXI from 'pixi.js';
import 'leaflet/dist/leaflet.css';
import 'leaflet-pixi-overlay';
import BezierEasing from './js/bezier-easing';
import './js/MarkerContainer';
import './js/example.min.js';
// import CubicBezier from "cubic-bezier-easing";

export default {
  name: 'PixiOverlayMarkers',
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
      pixiLayer: null,
      ticker: null,
      center: latLng(48.838565, 2.449264526367),
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
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
    showLongText() {
      this.showParagraph = !this.showParagraph;
    },
    innerClick() {
      alert('Click!');
    },

    draw() {
      // exemplo com poligonos
      var easing = BezierEasing(0, 0, 0.25, 1);

      function getRandom(min, max) {
        return min + Math.random() * (max - min);
      }

      var markersLength = 1000000;
      var loader = new PIXI.loaders.Loader();

      loader.add('marker', 'img/marker-icon.png');

      const vm = this;
      loader.load(function(loader, resources) {
        var texture = resources.marker.texture;
        vm.map.attributionControl.setPosition('bottomleft');
        vm.map.zoomControl.setPosition('bottomright');
        vm.pixiLayer = (function() {
          var zoomChangeTs = null;
          var pixiContainer = new PIXI.Container();
          var innerContainer = new PIXI.particles.ParticleContainer(
            markersLength,
            { vertices: true }
          );
          // add properties for our patched particleRenderer:
          innerContainer.texture = texture;
          innerContainer.baseTexture = texture.baseTexture;
          innerContainer.anchor = { x: 0.5, y: 1 };

          pixiContainer.addChild(innerContainer);
          var doubleBuffering =
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
          var initialScale;
          return L.pixiOverlay(
            function(utils, event) {
              var zoom = utils.getMap().getZoom();
              var container = utils.getContainer();
              var renderer = utils.getRenderer();
              var project = utils.latLngToLayerPoint;
              var getScale = utils.getScale;
              var invScale = 1 / getScale();

              if (event?.type === 'add') {
                var origin = project([(48.7 + 49) / 2, (2.2 + 2.8) / 2]);
                innerContainer.x = origin.x;
                innerContainer.y = origin.y;
                initialScale = invScale / 8;
                innerContainer.localScale = initialScale;
                for (var i = 0; i < markersLength; i++) {
                  var coords = project([
                    getRandom(48.7, 49),
                    getRandom(2.2, 2.8),
                  ]);
                  // our patched particleContainer accepts simple {x: ..., y: ...} objects as children:
                  innerContainer.addChild({
                    x: coords.x - origin.x,
                    y: coords.y - origin.y,
                  });
                }
              }

              if (event?.type === 'zoomanim') {
                var targetZoom = event.zoom;
                if (targetZoom >= 16 || zoom >= 16) {
                  zoomChangeTs = 0;
                  var targetScale =
                    targetZoom >= 16 ? 1 / getScale(event.zoom) : initialScale;
                  innerContainer.currentScale = innerContainer.localScale;
                  innerContainer.targetScale = targetScale;
                }
                return;
              }

              if (event?.type === 'redraw') {
                var delta = event.delta;
                if (zoomChangeTs !== null) {
                  var duration = 17;
                  zoomChangeTs += delta;
                  var lambda = zoomChangeTs / duration;
                  if (lambda > 1) {
                    lambda = 1;
                    zoomChangeTs = null;
                  }
                  lambda = easing(lambda);
                  innerContainer.localScale =
                    innerContainer.currentScale +
                    lambda *
                      (innerContainer.targetScale -
                        innerContainer.currentScale);
                } else {
                  return;
                }
              }

              renderer.render(container);
            },
            pixiContainer,
            {
              doubleBuffering: doubleBuffering,
              destroyInteractionManager: true,
            }
          );
        })();

        vm.pixiLayer.addTo(vm.map);

        vm.ticker = new PIXI.ticker.Ticker();
        vm.ticker.add(function(delta) {
          vm.pixiLayer.redraw({ type: 'redraw', delta: delta });
        });
      });
    },
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
      this.ticker.stop();
    },
    zoomStart() {
      this.ticker?.start();
    },
    zoomEnd() {
      this.ticker?.stop();
    },
    boundsUpdate() {},
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
