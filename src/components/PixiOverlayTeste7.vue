<template>
  <div class="hello">
    <h1>Olá {{ msg }}</h1>

    <div style="height: 500px; width: 100%">
      <div style="height: 200px; overflow: auto">
        <h1>
          teste7
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

export default {
  name: "PixiOverlayTeste7",
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
      var loader = new PIXI.loaders.Loader();
      loader.add("marker", "https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png");

      const response = await axios.get("data/cities.json");
      var markers = response.data;
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

        //cria uma camada de sobrepossição
        let pixiOverlay = L.pixiOverlay(
          (utils /* , event */) => {
            let zoom = utils.getMap().getZoom();
            let container = utils.getContainer();
            let renderer = utils.getRenderer();
            let project = utils.latLngToLayerPoint;
            let scale = 1 / utils.getScale();

            if (firstDraw) {
              for (var i = 0; i < markers.length; i++) {
                var coords = project([markers[i].latitude, markers[i].longitude]);
                //  debugger;
                //objeto marcador
                const bunny = new PIXI.Sprite(markerTexture);
                bunny.anchor.set(0.5);
                bunny.scale.set(scale);

                bunny.x = coords.x;
                bunny.y = coords.y;

                innerContainer.addChild(bunny);
                markerSprites.push(bunny);
              }
            }

            //definição da escala do marcador
            if (firstDraw || prevZoom !== zoom) {
              markerSprites.forEach(function (markerSprite) {
                markerSprite.scale.set(scale);
              });
              prevZoom = zoom;
            }
            /*
          debugger;
       	if (event.type === 'add') {
            markers.forEach(function(marker) {
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
        pixiOverlay.addTo(this.$refs.map.mapObject);

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
