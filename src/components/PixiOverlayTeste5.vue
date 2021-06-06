<template>
  <div class="hello">
    <h1>Olá {{ msg }}</h1>

    <div style="height: 500px; width: 100%">
      <div style="height: 200px; overflow: auto">
        <h1>
          teste5
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
import "../assets/js/tools.min.js";
import * as d3 from "d3";
//import json from "./data/communes.json";
import axios from "axios";

export default {
  name: "PixiOverlayTeste5",
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
        .add("focusPlane", "../assets/img/focus-plane.png")
        .add("circle", "../assets/img/circle.png")
        .add("focusCircle", "../assets/img/focus-circle.png")
        .add("bicycle", "../assets/img/bicycle.png")
        .add("focusBicycle", "../assets/img/focus-bicycle.png");

      loader.load(async (loader, resources) => {
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

        //   debugger;
        //const response = await axios.get("https://api.npms.io/v2/search?q=vue");
        const response = await axios.get("data/communes.json");
        var markers = response.data;
        //  var markers = this.info;
        //   getJSON(json, function (markers) {
        /*    var map = L.map("map").setView([46.953387, 2.892341], 6);
          L.tileLayer("//stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png", {
            subdomains: "abcd",
            attribution:
              'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
            minZoom: 6,
            maxZoom: 18,
          }).addTo(map); */
        /*
         */
        //  var legend = document.querySelector("div.legend.geometry");
        // var legendContent = legend.querySelector(".content");
        /*  this.$refs.map.attributionControl.setPosition("bottomleft");
        this.$refs.map.zoomControl.setPosition("bottomright"); */
        var vm = this;
        vm.map.attributionControl.setPosition("bottomleft");
        vm.map.zoomControl.setPosition("bottomright");

        var firstDraw = true;
        var prevZoom;
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
        var pixiOverlay = L.pixiOverlay(
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

            function findMarker(ll) {
              var layerPoint = project(ll);
              var quadTree = quadTrees[utils.getMap().getZoom()];
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
            }

            if (firstDraw) {
              prevZoom = zoom;

              markers.map((marker) => {
                // for (var i = 0; i < markers.length; i++) {
                //   markers.forEach(function (marker) {
                var coords = project([marker.latitude, marker.longitude]);
                var index = Math.floor(Math.random() * textures.length);
                var markerSprite = new PIXI.Sprite(textures[index]);
                markerSprite.textureIndex = index;
                markerSprite.x0 = coords.x;
                markerSprite.y0 = coords.y;
                markerSprite.anchor.set(0.5, 0.5);
                var tint = d3
                  .color(colorScale(marker.avancement || Math.random() * 100))
                  .rgb();
                markerSprite.tint = 256 * (tint.r * 256 + tint.g) + tint.b;
                container.addChild(markerSprite);
                markerSprites.push(markerSprite);
                markerSprite.legend = marker.city || marker.label;
              });
              var quadTrees = {};
              for (var z = vm.map.getMinZoom(); z <= vm.map.getMaxZoom(); z++) {
                var rInit = (z <= 7 ? 10 : 24) / utils.getScale(z);
                quadTrees[z] = window.solveCollision(markerSprites, {
                  r0: rInit,
                  zoom: z,
                });
              }

              vm.map.on("click", function (e) {
                var redraw = false;
                if (focus) {
                  focus.texture = textures[focus.textureIndex];
                  focus = null;
                  //  L.DomUtil.addClass(legend, "hide");
                  //  legendContent.innerHTML = "";
                  redraw = true;
                }
                var marker = findMarker(e.latlng);
                if (marker) {
                  marker.texture = focusTextures[marker.textureIndex];
                  focus = marker;
                  //  legendContent.innerHTML = marker.legend;
                  //  L.DomUtil.removeClass(legend, "hide");
                  redraw = true;
                }
                if (redraw) utils.getRenderer().render(container);
              });
              var self = this;
              vm.map.on(
                "mousemove",
                L.Util.throttle(function (e) {
                  var marker = findMarker(e.latlng);
                  if (marker) {
                    L.DomUtil.addClass(self._container, "leaflet-interactive");
                  } else {
                    L.DomUtil.removeClass(self._container, "leaflet-interactive");
                  }
                }, 32)
              );
            }
            if (firstDraw || prevZoom !== zoom) {
              markerSprites.map((markerSprite) => {
                //   markerSprites.forEach(function (markerSprite) {
                var position = markerSprite.cache[zoom];
                // var position = markerSprite;
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
              });
            }

            var start = null;
            var delta = 250;
            function animate(timestamp) {
              var progress;
              if (start === null) start = timestamp;
              progress = timestamp - start;
              var lambda = progress / delta;
              if (lambda > 1) lambda = 1;
              lambda = lambda * (0.4 + lambda * (2.2 + lambda * -1.6));
              markerSprites.map((markerSprite) => {
                //markerSprites.forEach(function (markerSprite) {
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
        //      };
        //adiciona a sobreposição no mapa de referencia
        pixiOverlay.addTo(this.$refs.map.mapObject);
        //});
      }); /*

      var getJSON = function (url, successHandler, errorHandler) {
        var xhr = typeof XMLHttpRequest != "undefined" ? new XMLHttpRequest() : ""; // new ActiveXObject("Microsoft.XMLHTTP");
        xhr.open("get", url, true);
        xhr.onreadystatechange = function () {
          var status;
          var data;
          if (xhr.readyState == 4) {
            status = xhr.status;
            if (status == 200) {
              data = JSON.parse(xhr.responseText);
              successHandler && successHandler(data);
            } else {
              errorHandler && errorHandler(status);
            }
          }
        };
        xhr.send();
      };
*/

      /*   const getJSON = async (url) => {
        //"https://reactnative.dev/movies.json"
        try {
          let response = await fetch(url);
          let json = await response.json();
          console.log(json);
          //   debugger;
          console.log(url);
          return json;
        } catch (error) {
          console.error(error);
        }
      }; */
    },
  },
  created() {
    // GET request using axios with async/await
    /*  const response = await axios.get("https://api.npms.io/v2/search?q=vue");
    this.info = response.data.total; */
  },
  mounted() {
    /*   axios
      .get("https://api.coindesk.com/v1/bpi/currentprice.json")
      .then((response) => (this.info = response))
      .catch((error) => console.log(error));
    console.log("*mounted", this.$refs); // I can see myRef inside the $refs object in the console
    console.log("*mounted", this.$refs.map); // prints undefined
    //  console.log(this.$refs.mapObject); // Error: Cannot read property '0' of undefined
 */
    let externalScript = document.createElement("script");
    externalScript.setAttribute("src", "js/tools.min.js");
    externalScript.async = true;
    document.head.appendChild(externalScript);

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
