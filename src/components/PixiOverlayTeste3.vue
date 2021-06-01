<template>
  <div class="hello">
    <h1>Olá {{ msg }}</h1>

    <div style="height: 500px; width: 100%">
      <div style="height: 200px; overflow: auto">
        <h1>
          teste 3
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
//import {Loader, Container, ParticleContainer} from "pixi.js";
import "leaflet/dist/leaflet.css";
import "leaflet-pixi-overlay";
import { PixiOverlayMarkers } from "pixi-overlay-markers";
import axios from "axios";

export default {
  name: "PixiOverlayTeste3",
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
      var self = this;
      /*  var slider = document.getElementById("map");
      slider.oninput = function () {
        console.log("opacity", this.value);
        if (self.pixiOverlayWrapper) {
          self.pixiOverlayWrapper.updateProperty({ alpha: this.value });
        }
      };
 */
      self.map = this.$refs.map.mapObject;

      console.log(L);
      console.log(PIXI);
      console.log(PixiOverlayMarkers);
      console.log(axios);

      /*     self.map = L.map("map").setView([46.953387, 2.892341], 6);
      L.tileLayer("//stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png", {
        subdomains: "abcd",
        attribution:
          'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
        minZoom: 4,
        maxZoom: 18,
      }).addTo(self.map); */

      /*  self.map.attributionControl.setPosition("bottomleft");
      self.map.zoomControl.setPosition("bottomright");

      const resources = {
        white: "white-marker.png",
      };

      const colors = ["#FF0000", "#0000FF", "#FFFF00", "#FFA500"];

      self.pixiOverlayWrapper = new PixiOverlayMarkers(self.map, resources, {
        minScale: 0,
        maxScale: 8,
      });

      self.overlayMaps = {};
      function load(city) {
        if (city === "french-cities") {
          self.map.setView([46.953387, 2.892341], 6);
        } else if (city === "cities") {
          self.map.setView([37.49229399862877, -96.94335937500001], 4);
        }
        if (self.pixiOverlayWrapper.hasLayer(city)) {
          self.pixiOverlayWrapper.removeLayer(city);
        }
        const json = `${city}.json`; //;cities.json';
        axios.get(json).then((result) => {
          var markers = result.data.map((marker) => {
            marker.lat = marker.latitude;
            marker.lon = marker.longitude;
            return marker;
          });

          self.layer = self.pixiOverlayWrapper.createLayer(
            city,
            markers,
            (marker, textures) => {
              //use random colors...
              const index = Math.floor(Math.random() * colors.length);
              const hexColor = self.pixiOverlayWrapper.convertColorToHex(colors[index]);
              let markerSprite = new PIXI.Sprite(textures["white"]);

              markerSprite.tint = hexColor;
              markerSprite.originalTint = hexColor;
              markerSprite.buttonMode = true;
              markerSprite.interactive = true;
              markerSprite.hitArea = new PIXI.Circle(0, 0, 15);
              markerSprite.alpha = 0.7;

              let leafletMarker;
              markerSprite.on("click", () => {
                let content = ""; //marker.city || marker.label;
                debugger;
                Object.keys(marker).forEach((key) => {
                  content += `${key} : ${marker[key]} <br/>`;
                });
                let popup = L.popup({ className: "custom-popup" })
                  .setContent(content)
                  .setLatLng([marker.lat, marker.lon]);
                setTimeout(() => {
                  popup.openOn(self.map);
                }, 0);
              });
              markerSprite.on("mouseover", (event) => {
                //const hexColor = self.pixiOverlayWrapper.convertColorToHex("#00000");
                markerSprite.tint = hexColor;

                markerSprite.alpha = 1;
                markerSprite._runTransformation = (sprite, project, scale, invScale) => {
                  let newScale = 0.65 / scale;
                  sprite.scale.set(newScale);
                };
                //markerSprite.filters = [new window.__pixi_filters.GlowFilter(15, 2, 1, 0xFF0000, 0.5)];
                markerSprite.filters = [
                  new window.__pixi_filters.GlowFilter(5, 8, 8, 0x22228c, 1),
                ];

                self.pixiOverlayWrapper.update();
              });

              markerSprite.on("mouseout", () => {
                //markerSprite.tint = markerSprite.originalTint;
                markerSprite.alpha = 0.7;
                markerSprite._runTransformation = (sprite, project, scale, invScale) => {
                  sprite.scale.set(invScale);
                };
                markerSprite.filters = [];
                self.pixiOverlayWrapper.update();
              });
              return markerSprite;
            }
          );
          //self.pixiOverlayWrapper.createLayer(city, markers);
          self.pixiOverlayWrapper.update();
        });
      }
      load("french-cities"); */
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
