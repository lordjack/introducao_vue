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
          "application-token": "477041f3-23f6-42f1-ade0-8285a4384ecb",
          "user-token": "c86f011b-5072-4916-97d4-2eac09dc183d",
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
        pixiContainer.interactive = true;
        pixiContainer.buttonMode = true;

        //  let innerContainer = new PIXI.Container();
        // pixiContainer.addChild(innerContainer);

        //variaveis que serão as flags
        let firstDraw = true;
        var frame = null;
        let prevZoom;
        //    var initialScale;
        var markerSprites = [];
        var doubleBuffering =
          /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        var focus = null;
        vm.map.attributionControl.setPosition("bottomleft");
        vm.map.zoomControl.setPosition("bottomright");
        var legend = document.querySelector("div.legend.geometry");
        var legendContent = legend.querySelector(".content");
        //cria uma camada de sobrepossição
        let pixiOverlay = L.pixiOverlay(
          (utils, event) => {
            /*  if (frame) {
              cancelAnimationFrame(frame);
              frame = null;
            } */
            let zoom = utils.getMap().getZoom();
            let container = utils.getContainer();
            let renderer = utils.getRenderer();
            let project = utils.latLngToLayerPoint;
            let scale = 1 / utils.getScale();

            //  console.log("Qtd de Dados: " + markers.length);
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
                var markerSprite = new PIXI.Sprite(markerTexture);
                markerSprite.anchor.set(0.5);
                markerSprite.scale.set(scale);
                markerSprite.interactive = true;

                markerSprite.x = coords.x;
                markerSprite.y = coords.y;

                container.addChild(markerSprite);
                let legenda = markers[i].nome.value;
                markerSprite.legend = markers[i].nome.value;

                /*     ;
                markerSprite.latitude = markers[i].location.value.coordinates[0][1]; //latitude
                markerSprite.longitude = markers[i].location.value.coordinates[0][0]; //longitude */

                /*   markerSprite.popup = L.popup({ autoPan: false, pane: "popupPane" })
                  .setLatLng([
                    markers[i].location.value.coordinates[0][1],
                    markers[i].location.value.coordinates[0][0],
                  ])
                  .setContent(markers[i].nome.value);
                // .openOn(vm.map);

                // vm.map.openPopup(popup);
              */
                /*    markerSprite.popup = L.popup()
                  .setLatLng([
                    markers[i].location.value.coordinates[0][1],
                    markers[i].location.value.coordinates[0][0],
                  ])
                  .setContent(markers[i].nome.value)
                  .openOn(vm.map);
                */
                markerSprites.push(markerSprite);
              }
              /*  utils.getMap().on("click", function (e) {
                // not really nice but much better than before
                // good starting point for improvements
                var interaction = utils.getRenderer().plugins.interaction;
                var pointerEvent = e.originalEvent;
                var pixiPoint = new PIXI.Point();
                // get global click position in pixiPoint:
                interaction.mapPositionToPoint(
                  pixiPoint,
                  pointerEvent.clientX,
                  pointerEvent.clientY
                );
                console.log("teste2: ");
                console.log(e.originalEvent);
                // get what is below the click if any:
                var target = interaction.hitTest(pixiPoint, container);
                console.log(pointerEvent.clientX);
                console.log(pointerEvent.clientY);

                if (target && target.popup) {
                  console.log("teste2");
                  target.popup.openOn(vm.map);
                }
              }); */

              /*  utils.getMap().on("click", function (e) {
                // not really nice but much better than before
                // good starting point for improvements
                var interaction = utils.getRenderer().plugins.interaction;
                var pointerEvent = e.originalEvent;

                var pixiPoint = new PIXI.Point();
                // get global click position in pixiPoint:
                interaction.mapPositionToPoint(
                  pixiPoint,
                  pointerEvent.clientX,
                  pointerEvent.clientY
                );
                // get what is below the click if any:
                var target = interaction.hitTest(pixiPoint, container);
                if (target && target.popup) {
                  target.popup.openOn(vm.map);
                  console.log(interaction);
                }
              });
                */
            }
            var quadTrees = {};
            for (var z = vm.map.getMinZoom(); z <= vm.map.getMaxZoom(); z++) {
              var rInit = (z <= 7 ? 16 : 24) / utils.getScale(z);
              // console.log(window);
              quadTrees[z] = solveCollision(markerSprites, { r0: rInit, zoom: z });
              // console.log(quadTrees);
            }
            function findMarker(ll) {
              var layerPoint = project(ll);
              var quadTree = quadTrees[utils.getMap().getZoom()];
              // console.log(quadTree);
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
            vm.map.on("click", function (e) {
              var redraw = false;
              if (focus) {
                //    focus.texture = markerTexture[focus.textureIndex];
                // marker.texture = markerTexture[marker.textureIndex];
                focus.texture = markerTexture;
                focus = null;
                L.DomUtil.addClass(legend, "hide");
                legendContent.innerHTML = "";
                vm.legend = redraw = true;
              }
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
              /*  if (item.latitude == e.latlng.lat && item.longitude == e.latlng.lng) {
                console.log(item.legend);
                console.log(item.longitude);
              } */
              // }
              // vm.legend = markerSprites.legend;
              //  console.log(vm.legend);
              //  console.log(markerSprites);

              // this.withPopup = e.latlng;
              /*          var marker = findMarker(e.latlng);
              //var marker = e.latlng;
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

            /*   vm.map.on(
              "mousemove",
              L.Util.throttle(function (e) {
                var marker = findMarker(e.latlng);
                // console.log(marker);
                //  console.log(e.latlng);
                if (marker) {
                  // L.DomUtil.addClass(self._container, "leaflet-interactive");
                } else {
                  // L.DomUtil.removeClass(self._container, "leaflet-interactive");
                }
              }, 32)
            ); */

            //definição da escala do marcador
            if (firstDraw || prevZoom !== zoom) {
              markerSprites.forEach(function (markerSprite) {
                markerSprite.scale.set(scale);
              });
              prevZoom = zoom;
              /*   markerSprites.forEach(function (markerSprite) {
                //  var position = markerSprite.cache[zoom];
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
              });*/
            }

            firstDraw = false;
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
      });

      function solveCollision(t, e) {
        e = e || {};
        var r = d3
          .quadtree()
          .x(function (t) {
            return t.xp;
          })
          .y(function (t) {
            return t.yp;
          });
        void 0 !== e.extent && r.extent(e.extent);
        var g = 0;
        t.forEach(function (t) {
          (t.xp = t.x0),
            (t.yp = t.y0),
            void 0 !== e.r0 && (t.r0 = e.r0),
            (t.r = t.r0),
            (t.xMin = t.x0 - t.r0),
            (t.xMax = t.x0 + t.r0),
            (t.yMin = t.y0 - t.r0),
            (t.yMax = t.y0 + t.r0);
          var y,
            m = [];
          r.visit(
            ((y = t),
            function (t, n, e, r, i) {
              if (!t.length)
                for (
                  ;
                  y.xMax > t.data.xMin &&
                    y.xMin < t.data.xMax &&
                    y.yMax > t.data.yMin &&
                    y.yMin < t.data.yMax &&
                    ((o = t.data),
                    (d = p = f = h = l = c = s = u = a = void 0),
                    (h = y.xp - o.xp),
                    (f = y.yp - o.yp),
                    (p = h * h + f * f),
                    (d = y.r + o.r),
                    p < d * d &&
                      ((s = { r: o.r, xp: o.xp, yp: o.yp, from: o }),
                      m.push(s),
                      (h = Math.sqrt(p)),
                      (f = y.r < s.r ? ((a = s), y) : ((a = y), s)),
                      (s = ((d = a.r) + (o = f.r) + h) / 4),
                      (l =
                        0 < p
                          ? ((c = (f.xp - a.xp) / h), (f.yp - a.yp) / h)
                          : ((l = 2 * Math.PI * Math.random()),
                            (c = Math.cos(l)),
                            Math.sin(l))),
                      (h =
                        s <= o ? ((u = s / d), s / o) : ((u = (d - o + h) / (2 * d)), 1)),
                      (a.r *= u),
                      (f.r *= h),
                      (a.xp += (u - 1) * d * c),
                      (a.yp += (u - 1) * d * l),
                      (f.xp += (1 - h) * o * c),
                      (f.yp += (1 - h) * o * l),
                      (a.xMin = a.xp - a.r),
                      (a.xMax = a.xp + a.r),
                      (a.yMin = a.yp - a.r),
                      (a.yMax = a.yp + a.r),
                      (f.xMin = f.xp - f.r),
                      (f.xMax = f.xp + f.r),
                      (f.yMin = f.yp - f.r),
                      (f.yMax = f.yp + f.r))),
                    (t = t.next);

                );
              var o, a, u, s, c, l, h, f, p, d;
              return n > y.xMax + g || r + g < y.xMin || e > y.yMax + g || i + g < y.yMin;
            })
          ),
            (g = Math.max(g, t.r)),
            r.removeAll(
              m.map(function (t) {
                return t.from;
              })
            );
          var n = m.map(function (t) {
            var n = t.from;
            return (
              (n.xp = t.xp),
              (n.yp = t.yp),
              (n.r = t.r),
              (n.xMin = t.xMin),
              (n.xMax = t.xMax),
              (n.yMin = t.yMin),
              (n.yMax = t.yMax),
              n
            );
          });
          n.push(t), r.addAll(n);
        }),
          void 0 !== e.zoom &&
            t.forEach(function (t) {
              (t.cache = t.cache || {}), (t.cache[e.zoom] = { x: t.xp, y: t.yp, r: t.r });
            });
        var n = 0;
        return (
          t.forEach(function (t) {
            n = Math.max(n, t.r);
          }),
          (r.rMax = n),
          r
        );
      }
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
