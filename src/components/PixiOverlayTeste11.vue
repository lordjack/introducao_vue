<template>
  <div class="hello">
    <h1>Olá {{ msg }}</h1>

    <div style="height: 500px; width: 100%">
      <div style="height: 200px; overflow: auto">
        <h1>
          teste11 - SGeol Marcadores
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
window.d3 = d3;
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
      loader
        .add("plane", "img/plane.png")
        .add("focusPlane", "img/focus-plane.png")
        .add("circle", "img/circle.png")
        .add("focusCircle", "img/focus-circle.png")
        .add("bicycle", "img/bicycle.png")
        .add("focusBicycle", "img/focus-bicycle.png");

      //  const response = await axios.get("data/cities.json");

      const url = `http://sgeolayers.imd.ufrn.br/sgeol-geologia/v2/rn_rural`;
      const options = {
        headers: {
          "application-token": "fc4077ca-27c7-4aeb-a562-97ef6022181c",
          "user-token": "f759f3c9-d2f4-4b3a-9f3d-a42cd007f163",
        },
      };
      let response = await axios.get(url, options);

      var markers = response.data;
      // markers.forEach((element) => {
      //console.log(element.location);
      // });

      function findMarker(ll, quadTrees, utils) {
        var project = utils.latLngToLayerPoint;
        var layerPoint = project(ll);
        var quadTree = quadTrees[utils.getMap().getZoom()];
        var marker;
        var rMax = quadTree?.rMax;
        var found = false;
        quadTree?.visit(function (quad, x1, y1, x2, y2) {
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
      }

      const vm = this;
      loader.load((loader, resources) => {
        //textura
        var textures = [
          resources.plane.texture,
          resources.circle.texture,
          resources.bicycle.texture,
        ];
        var focusTextures = [
          resources.focusPlane.texture,
          resources.focusCircle.texture,
          resources.focusBicycle.texture,
        ];

        vm.map.attributionControl.setPosition("bottomleft");
        vm.map.zoomControl.setPosition("bottomright");
        var legend = document.querySelector("div.legend.geometry");
        var legendContent = legend.querySelector(".content");

        //variaveis que serão as flags
        let firstDraw = true;
        let prevZoom;
        //    var initialScale;
        var markerSprites = [];
        var colorScale = d3
          .scaleLinear()
          .domain([0, 50, 100])
          .range(["#c6233c", "#ffd300", "#008000"]);
        var frame = null;
        var focus = null;
        var pixiContainer = new PIXI.Container();

        var doubleBuffering =
          /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        //cria uma camada de sobrepossição
        let pixiOverlay = L.pixiOverlay(
          (utils) => {
            var zoom = utils.getMap().getZoom();
            if (frame) {
              cancelAnimationFrame(frame);
              frame = null;
            }
            var container = utils.getContainer();
            var renderer = utils.getRenderer();
            var project = utils.latLngToLayerPoint;
            var scale = utils.getScale();
            var invScale = 1 / scale;

            if (firstDraw) {
              markers.forEach((marker) => {
                //   for (var i = 0; i < markers.length; i++) {
                var coords = project([
                  marker.location.value.coordinates[0][1], //latitude
                  marker.location.value.coordinates[0][0], //longitude
                ]);
                //  console.log(marker);
                //  debugger;
                //objeto marcador
                var index = Math.floor(Math.random() * textures.length);
                var markerSprite = new PIXI.Sprite(textures[index]);
                markerSprite.textureIndex = index;
                markerSprite.x0 = coords.x;
                markerSprite.y0 = coords.y;
                markerSprite.anchor.set(0.5, 0.5);
                var tint = d3
                  // .color(colorScale(marker.avancement || Math.random() * 100))
                  .color(colorScale(Math.random() * 100))
                  .rgb();
                markerSprite.tint = 256 * (tint.r * 256 + tint.g) + tint.b;
                container.addChild(markerSprite);
                markerSprites.push(markerSprite);
                markerSprite.legend = marker.city || marker.label;

                //   let legenda = markers[i].nome.value;
                //  markerSprite.legend = markers[i].nome.value;
              });
              var quadTrees = {};
              for (var z = vm.map.getMinZoom(); z <= vm.map.getMaxZoom(); z++) {
                var rInit = (z <= 7 ? 16 : 24) / utils.getScale(z);
                quadTrees[z] = window.solveCollision(markerSprites, {
                  r0: rInit,
                  zoom: z,
                });
              }

              // eslint-disable-next-line no-debugger
              //debugger;
              vm.map.on("click", function (e) {
                var redraw = false;
                if (focus) {
                  focus.texture = textures[focus.textureIndex];
                  focus = null;
                  L.DomUtil.addClass(legend, "hide");
                  legendContent.innerHTML = "";
                  redraw = true;
                }
                var marker = findMarker(e.latlng, quadTrees, utils);
                if (marker) {
                  marker.texture = focusTextures[marker.textureIndex];
                  focus = marker;
                  legendContent.innerHTML = marker.legend;
                  L.DomUtil.removeClass(legend, "hide");
                  redraw = true;
                }
                if (redraw) utils.getRenderer().render(container);
              });
              //var self = this;
              vm.map.on(
                "mousemove",
                L.Util.throttle(function (e) {
                  var marker = findMarker(e.latlng, quadTrees, utils);
                  if (marker) {
                    console.log("Teste1");
                    //  L.DomUtil.addClass(self._container, "leaflet-interactive");
                  } else {
                    console.log("Teste2");
                    //L.DomUtil.removeClass(self._container, "leaflet-interactive");
                  }
                }, 32)
              );
            }

            //definição da escala do marcador
            if (firstDraw || prevZoom !== zoom) {
              /*
                Esta dando erro no Position
                */
              markerSprites.forEach((markerSprite) => {
                var position = markerSprite.cache[zoom]
                  ? markerSprite.cache[zoom]
                  : utils.getMap().getZoom();
                console.log(position);
                if (firstDraw) {
                  markerSprite.x = position?.x;
                  markerSprite.y = position?.y;
                  markerSprite.scale.set(
                    position?.r * scale < 16 ? position?.r / 16 : invScale
                  );
                } else {
                  markerSprite.currentX = markerSprite.x;
                  markerSprite.currentY = markerSprite.y;
                  markerSprite.targetX = position?.x;
                  markerSprite.targetY = position?.y;
                  markerSprite.currentScale = markerSprite.scale.x;
                  markerSprite.targetScale =
                    position?.r * scale < 16 ? position?.r / 16 : invScale;
                }
              });
            }

            //   debugger;
            var start = null;
            var delta = 250;
            function animate(timestamp) {
              var progress;
              if (start === null) start = timestamp;
              progress = timestamp - start;
              var lambda = progress / delta;
              if (lambda > 1) lambda = 1;
              lambda = lambda * (0.4 + lambda * (2.2 + lambda * -1.6));
              markerSprites.forEach(function (markerSprite) {
                markerSprite.x =
                  markerSprite.currentX +
                  lambda * (markerSprite.targetX - markerSprite.currentX);
                markerSprite.y =
                  markerSprite.currentY +
                  lambda * (markerSprite.targetY - markerSprite.currentY);
                markerSprite.scale.set(
                  markerSprite.currentScale +
                    lambda * (markerSprite.targetScale - markerSprite.currentScale)
                );
              });
              renderer.render(container);
              if (progress < delta) {
                frame = requestAnimationFrame(animate);
              }
            }
            if (!firstDraw && prevZoom !== zoom) {
              frame = requestAnimationFrame(animate);
            }
            firstDraw = false;
            prevZoom = zoom;
            renderer.render(container);
          },
          pixiContainer,
          {
            doubleBuffering: doubleBuffering,
            destroyInteractionManager: true,
          }
        );
        //adiciona a sobreposição no mapa de referencia
        pixiOverlay.addTo(vm.map);
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
