<template>
  <div class="hello">
    <h1>Olá {{ msg }}</h1>

    <div style="height: 500px; width: 100%">
      <div style="height: 200px; overflow: auto">
        <h1>
          teste8
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
        <l-tile-layer :url="url" :attribution="attribution"/>
        <l-marker :lat-lng="withPopup">
          <l-icon icon-url="https://pixijs.io/examples/examples/assets/bunny.png"/>
          <l-popup>
            <div @click="innerClick">
              Eu sou um popup
              <p v-show="showParagraph">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed
                pretium nisl, ut sagittis sapien. Sed vel sollicitudin nisi. Donec finibus
                semper metus id malesuada.
              </p>
            </div>
          </l-popup>
        </l-marker>
        <l-marker :lat-lng="withTooltip">
          <l-icon icon-url="https://pixijs.io/examples/examples/assets/bunny.png"/>
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
import L, {latLng /* icon */} from "leaflet";
import {LMap, LTileLayer, LMarker, LIcon, LPopup, LTooltip} from "vue2-leaflet";
import * as PIXI from "pixi.js";
import "leaflet/dist/leaflet.css";
import "leaflet-pixi-overlay";
import axios from "axios";
import * as d3 from "d3";
import * as topojson from "topojson-client";

export default {
  name: "PixiOverlayTeste8",
  props: {
    msg: String,
  },
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LIcon,
    LPopup,
    LTooltip,
  },
  data() {
    return {
      zoom: 8,
      center: latLng(38.120726, -90.740616),
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      withPopup: latLng(38.120726, -90.740616),
      withTooltip: latLng(38.120726, -91.740616),
      currentZoom: 11.5,
      currentCenter: latLng(38.120726, -90.740616),
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.0,
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
      alert("Clicou aqui!");
    },

    async draw() {
      //carregador
      const response = await axios.get("data/us.topojson");
      var topo = response.data;

      //  loader.load((loader, resources) => {
      var firstDraw = true;
      var colorScale = d3
          .scaleLinear()
          .domain([0, 50, 100])
          .range(["#c6233c", "#ffd300", "#008000"]);
      var pixiContainer = new PIXI.Graphics();
      var doubleBuffering =
          /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

      //cria uma camada de sobrepossição
      let pixiOverlay = L.pixiOverlay(
          (utils /* , event */) => {
            var container = utils.getContainer();
            var renderer = utils.getRenderer();
            var project = utils.latLngToLayerPoint;

            if (firstDraw) {
              var geojson = topojson.feature(topo, topo.objects.usStates);

              geojson.features.forEach(function (feature) {
                var alpha, color;
                var tint = d3.color(colorScale(Math.random() * 100)).rgb();
                color = 256 * (tint.r * 256 + tint.g) + tint.b;
                alpha = 0.8;
                if (feature.geometry === null) return;

                if (feature.geometry.type === "Polygon") {
                  drawPoly(color, alpha, container, project)(feature.geometry.coordinates);
                } else if (feature.geometry.type == "MultiPolygon") {
                  feature.geometry.coordinates.forEach(drawPoly(color, alpha, container, project));
                }
              });
            }
            firstDraw = false;
            renderer.render(container);
          },
          pixiContainer,
          {
            doubleBuffering: doubleBuffering,
            destroyInteractionManager: true,
          }
      );
      //adiciona a sobreposição no mapa de referencia
      pixiOverlay.addTo(this.$refs.map.mapObject);

      function drawPoly(color, alpha, container, project) {
        return function (poly) {
          var shape = new PIXI.Polygon(
              poly[0].map(function (point) {
                var proj = project([point[1], point[0]]);
                return new PIXI.Point(proj.x, proj.y);
              })
          );
          container.beginFill(color, alpha);
          container.drawShape(shape);
          if (poly.length > 1) {
            for (var i = 1; i < poly.length; i++) {
              var hole = new PIXI.Polygon(
                  poly[i].map(function (point) {
                    var proj = project([point[1], point[0]]);
                    return new PIXI.Point(proj.x, proj.y);
                  })
              );
              container.drawShape(hole);
              container.addHole();
            }
          }
        };
      }

      /*      var ticker = new PIXI.ticker.Ticker();
        ticker.add(function (delta) {
          pixiOverlay.redraw({ type: "redraw", delta: delta });
        });
        ticker.start(); */
      // });
      /*  function getRandom(min, max) {
        return min + Math.random() * (max - min);
      } */
    },
  },
  mounted() {
 /*   let externalScript = document.createElement("script");
    externalScript.setAttribute("src", "js/tools.min.js");
    externalScript.async = true;
    document.head.appendChild(externalScript);*/

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
