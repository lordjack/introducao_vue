<template>
  <div class="hello">
    <h1> Olá {{ msg }}</h1>
    <div id='app'>
       <div ref='map' style='height: 300px'></div> 
    </div>
  
    <div style="height: 500px; width: 100%">
        <div style="height: 200px; overflow: auto;">
          <h1> teste1 <!-- {{  pOverlay */ }} --></h1>
        <p>Marcação lugar no Mapa {{ withPopup.lat }}, {{ withPopup.lng }}</p>
        <p> Centro {{ currentCenter }} o zoom é: {{ currentZoom }}</p>
        <button @click="showLongText">
            Teste
        </button>
        <button @click="showMap = !showMap">
            Mostrar/Ocutar
        </button>
        </div>
        <l-map
            ref="map"
            v-if="showMap"
            :zoom="zoom"
            :center="center"
            :options="mapOptions"
            style="height: 60%"
            @update:center="centerUpdate"
            @update:zoom="zoomUpdate"
            @ready="doSomethingOnReady()"
            >
        <l-tile-layer
            :url="url"
            :attribution="attribution"
        />
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

  </div>

</template> 

<script>
import L, { latLng }  from 'leaflet';
import { LMap, LTileLayer, LMarker, LPopup, LTooltip } from "vue2-leaflet";
import * as PIXI from 'pixi.js'; 
import "leaflet/dist/leaflet.css";
import 'leaflet-pixi-overlay';

export default {
  name: 'PixiOverlay',
  props: {
    msg: String
  },
 components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip 
 },
  data() {
    return {
      zoom: 13,
      center: latLng(47.41322, -1.219482),
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      withPopup: latLng(47.41322, -1.219482),
      withTooltip: latLng(47.41422, -1.250482),
      currentZoom: 11.5,
      currentCenter: latLng(47.41322, -1.219482),
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.5
      },
      showMap: true,
      pOverlay:null,
      map: null
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
    doSomethingOnReady() {
        this.map = this.$refs.map.mapObject
    },
    draw() {
        let loader = new PIXI.Loader()
        loader.add('marker', 'https://pixijs.io/examples/examples/assets/bunny.png')
        loader.load((loader, resources) => {
            let markerTexture = resources.marker.texture
            let markerLatLng = [51.505, -0.09]
            let marker = new PIXI.Sprite(markerTexture)
            marker.anchor.set(0.5, 1)

            let pixiContainer = new PIXI.Container()
            pixiContainer.addChild(marker)

            let firstDraw = true
            let prevZoom

            let pixiOverlay = L.pixiOverlay(utils => {
                let zoom = utils.getMap().getZoom()
                let container = utils.getContainer()
                let renderer = utils.getRenderer()
                let project = utils.latLngToLayerPoint
                let scale = utils.getScale()

                if (firstDraw) {
                    let markerCoords = project(markerLatLng)
                    marker.x = markerCoords.x
                    marker.y = markerCoords.y
                }

                if (firstDraw || prevZoom !== zoom) {
                    marker.scale.set(1 / scale)
                }

                firstDraw = true
                prevZoom = zoom
                renderer.render(container)
            }, pixiContainer)

            pixiOverlay.addTo(this.$refs.map.mapObject)

          //  this.pOverlay = pixiOverlay;
        })
    }, 
  },
  mounted() { 
       /* this.map = L.map(this.$refs.map).setView([51.505, -0.09], 13)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
        }).addTo(this.map) */

        this.$nextTick(() => {
            this.map = this.$refs.map.mapObject // work as expected
        })

        this.draw() 
    }
}
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
