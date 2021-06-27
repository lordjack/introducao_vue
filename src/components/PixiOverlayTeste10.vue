<template>
  <div class="hello">
    <h1>Olá {{ msg }}</h1>

    <div style="height: 500px; width: 100%">
      <div style="height: 200px; overflow: auto">
        <h1>
          teste10 - SGeol Marcadores
          <!-- {{  pOverlay */ }} -->
        </h1>
        <div class="legend geometry top center hide">
          <div class="wrapper">
            <div class="content">
              Sou uma legenda: {{ legend }}
              <div @click="innerClick">Eu sou um popup</div>
              Nome Item:{{ withPopup.lat }}
            </div>
          </div>
        </div>
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
          <l-icon icon-url="https://pixijs.io/examples/examples/assets/bunny.png" />
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
          <l-icon icon-url="https://pixijs.io/examples/examples/assets/bunny.png" />
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
import L, { latLng /* icon */ } from "leaflet";
import { LMap, LTileLayer, LMarker, LIcon, LPopup, LTooltip } from "vue2-leaflet";
import * as PIXI from "pixi.js";
import "leaflet/dist/leaflet.css";
import "leaflet-pixi-overlay";
import axios from "axios";
import * as d3 from "d3";
//import "./js/MarkerContainer";
import "./js/example.min.js";
import "./js/tools.min.js";

export default {
  name: "PixiOverlayTeste10",
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
      center: latLng(-6.031311, -35.996704),
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      withPopup: latLng(-5.18965, -36.10126),
      withTooltip: latLng(-5.58965, -36.11126),
      currentZoom: 11.5,
      currentCenter: latLng(-6.031311, -35.996704),
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.0,
      },
      showMap: true,
      map: null,
      legend: null,
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
      var loader = new PIXI.loaders.Loader();
      loader.add("marker", "https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png");

      //  const response = await axios.get("data/cities.json");

      const url = `http://sgeolayers.imd.ufrn.br/sgeol-geologia/v2/rn_rural`;
      const options = {
        headers: {
          "application-token": "d819fd42-89cc-4475-b0f1-fbbbe199acd9",
          "user-token": "81926f21-2fd5-4d66-af16-904f9f776c1b",
        },
      };
      let response = await axios.get(url, options);

      var markers = response.data;
      // markers.forEach((element) => {
      //console.log(element.location);
      // });
      const vm = this;
      loader.load((loader, resources) => {
        //textura
        let markerTexture = resources.marker.texture;
        //  let markerLatLng = [47.405437, -1.23373];
        let marker = new PIXI.Sprite(markerTexture);

        //ancora local de origem valor padrão 0.0
        marker.anchor.set(0.5, 1);
        //   var zoomChangeTs = 1;

        //conteiner para carregar os objetos
        let pixiContainer = new PIXI.Container();
        pixiContainer.addChild(marker);

        let innerContainer = new PIXI.Container();
        pixiContainer.addChild(innerContainer);

        //variaveis que serão as flags
        let firstDraw = true;
        let prevZoom;
        //    var initialScale;
        var markerSprites = [];
        var doubleBuffering =
          /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        var focus = null;
        vm.map.attributionControl.setPosition("bottomleft");
        vm.map.zoomControl.setPosition("bottomright");
        //  var legend = document.querySelector("div.legend.geometry");
        //   var legendContent = legend.querySelector(".content");
        //cria uma camada de sobrepossição
        let pixiOverlay = L.pixiOverlay(
          (utils, event) => {
            let zoom = utils.getMap().getZoom();
            let container = utils.getContainer();
            let renderer = utils.getRenderer();
            let project = utils.latLngToLayerPoint;
            let scale = 1 / utils.getScale();

            console.log("Qtd de Dados: " + markers.length);
            var invScale = 1 / scale;
            if (firstDraw) {
              for (var i = 0; i < markers.length; i++) {
                // console.log(markers[i].nome.value);
                //console.log(markers[i].location.value.coordinates.longitude);
                var coords = project([
                  markers[i].location.value.coordinates[0][1], //latitude
                  markers[i].location.value.coordinates[0][0], //longitude
                ]);
                //  debugger;
                //objeto marcador
                const bunny = new PIXI.Sprite(markerTexture);
                bunny.anchor.set(0.5);
                bunny.scale.set(scale);

                bunny.x = coords.x;
                bunny.y = coords.y;

                innerContainer.addChild(bunny);
                markerSprites.push(bunny);
                /*   markerSprites[i].legend = markers[i].nome.value;
                markerSprites[i].latitude = markers[i].location.value.coordinates[0][1]; //latitude
                markerSprites[i].longitude = markers[i].location.value.coordinates[0][0]; //longitude */
              }
            }
            /*  var quadTrees = {};
            for (var z = vm.map.getMinZoom(); z <= vm.map.getMaxZoom(); z++) {
              var rInit = (z <= 7 ? 16 : 24) / utils.getScale(z);
              // quadTrees[z] = window.solveCollision(markerSprites, { r0: rInit, zoom: z });
            }
            function findMarker(ll) {
              var layerPoint = project(ll);
              var quadTree = quadTrees[utils.getMap().getZoom()];
              //  console.log(layerPoint);
              var marker;
              var rMax = quadTree.rMax;
              var found = false;
              quadTree.visit(function (quad, x1, y1, x2, y2) {
                if (!quad.length) {
                  var dx = quad.data.x - layerPoint.x;
                  var dy = quad.data.y - layerPoint.y;
                  var r = quad.data.scale.x * 16;
                  if (dx * dx + dy * dy <= r * r) {
                    marker = quad.data;
                    found = true;
                  }
                }
                return (
                  found ||
                  x1 > layerPoint.x + rMax ||
                  x2 + rMax < layerPoint.x ||
                  y1 > layerPoint.y + rMax ||
                  y2 + rMax < layerPoint.y
                );
              });
              return marker;
            } */
            vm.map.on("click", function (e) {
              /*   var redraw = false;
              if (focus) {
                focus.texture = markerTexture[focus.textureIndex];
                focus = null;
                L.DomUtil.addClass(legend, "hide");
                legendContent.innerHTML = "";
                redraw = true;
              } */
              console.log(e.latlng);
              //console.log("Qtd de Dados: " + markerSprites.length);
              //  for (var i = 0; i < markers.length; i++) {
              //     console.log(i);
              //   markers.forEach(async function (item) {
              /*    markerSprites[i].legend = markers[i].nome.value;
                markerSprites[i].latitude = markers[i].location.value.coordinates[0][1]; //latitude
                markerSprites[i].longitude = markers[i].location.value.coordinates[0][0]; //longitude */
              // console.log(item.legend);
              //  console.log(item.latitude);
              /*    console.log(markers[i].location.value.coordinates[0][1].toFixed(2));
                console.log(markers[i].location.value.coordinates[0][0].toFixed(2));
                console.log(
                  parseFloat(markers[i].location.value.coordinates[0][1]).toFixed(2) ==
                    parseFloat(e.latlng.lat.toFixed(2))
                ); */
              //   debugger;
              /* if (item.latitude == e.latlng.lat && item.longitude == e.latlng.lng) {
                  console.log(item.legend);
                  console.log(item.longitude);
                } */
              //    }
              // vm.legend = markerSprites.legend;
              //  console.log(vm.legend);
              //  console.log(markerSprites);

              // this.withPopup = e.latlng;
              // var marker = findMarker(e.latlng);
              /*         var marker = e.latlng;
              if (marker) {
                // marker.texture = markerTexture[marker.textureIndex];
                marker.texture = markerTexture;
                focus = marker;
                legendContent.innerHTML = marker.legend;
                L.DomUtil.removeClass(legend, "hide");
                redraw = true;
              }
              if (redraw) utils.getRenderer().render(container); */
            });

            //definição da escala do marcador
            if (firstDraw || prevZoom !== zoom) {
              markerSprites.forEach(function (markerSprite) {
                markerSprite.scale.set(scale);
              });
              prevZoom = zoom;
              /*     markerSprites.forEach(function (markerSprite) {
                // var position = markerSprite.cache[zoom];
                var position = markerSprite;
                if (firstDraw) {
                  markerSprite.x = position.x;
                  markerSprite.y = position.y;
                  markerSprite.scale.set(
                    position.r * scale < 16 ? position.r / 16 : invScale
                  );
                } else {
                  markerSprite.currentX = markerSprite.x;
                  markerSprite.currentY = markerSprite.y;
                  markerSprite.targetX = position.x;
                  markerSprite.targetY = position.y;
                  markerSprite.currentScale = markerSprite.scale.x;
                  markerSprite.targetScale =
                    position.r * scale < 16 ? position.r / 16 : invScale;
                }
              }); */
            }

            //   debugger;
            /* if (event?.type === "add") {
              markers.forEach(function (marker) {
                console.log(marker);
                var coords = project([marker.latitude, marker.longitude]);
                var index = Math.floor(Math.random() * markerTexture.length);
                var markerSprite = new PIXI.Sprite(markerTexture[index]);
                markerSprite.textureIndex = index;
                markerSprite.x = coords.x;
                markerSprite.y = coords.y;
                markerSprite.anchor.set(0.5, 0.5);
                markerSprite.scale.set(scale);
                //  var tint = d3.color(scale(Math.random() * 100)).rgb();
                // markerSprite.tint = 256 * (tint.r * 256 + tint.g) + tint.b;
                container.addChild(markerSprite);
                markerSprites.push(markerSprite);
              });
            }*/

            /*      if (event.type === "moveend" && prevZoom !== zoom) {
              markerSprites.forEach(function (markerSprite) {
                markerSprite.scale.set(scale);
              });
              prevZoom = zoom;
            }

            if (event.type === "redraw") {
              var delta = event.delta;
              markerSprites.forEach(function (markerSprite) {
                markerSprite.rotation -= 0.03 * delta;
              });
            } */
            firstDraw = true;
            prevZoom = zoom;
            //renderiza o objeto para sobreposição
            renderer.render(container);
          },
          pixiContainer,
          {
            doubleBuffering: doubleBuffering,
          }
        );
        //adiciona a sobreposição no mapa de referencia
        // pixiOverlay.addTo(this.$refs.map.mapObject);
        pixiOverlay.addTo(vm.map);

        /*      var ticker = new PIXI.ticker.Ticker();
        ticker.add(function (delta) {
          pixiOverlay.redraw({ type: "redraw", delta: delta });
        });
        ticker.start(); */
      });
      /*  function getRandom(min, max) {
        return min + Math.random() * (max - min);
      } */
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
