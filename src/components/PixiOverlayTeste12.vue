<template>
  <div class="hello">
    <div style="height: 500px; width: 100%">
      <div style="height: 200px; overflow: auto">
        <h1>Teste12 - PixiOverlay - SGeol</h1>
        <p>Marcação lugar no Mapa {{ withPopup.lat }}, {{ withPopup.lng }}</p>
        <p>Centro {{ currentCenter }} o zoom é: {{ currentZoom }}</p>
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
      </l-map>
    </div>
    <router-view></router-view>
    <div id="details">
      <div class="results">
        <div class="header">
          <span class="nom"><!-- {{ nom }} ({{ dpt }}, {{ circ }})--></span
          ><span class="close"></span>
        </div>
        <table>
          <tbody>
            <tr>
              <td>Inscrits:<!-- {{ inscrits }}--></td>
              <td>
                Abstention:
                <!--{{ getRatio(abs, inscrits) }}%-->
              </td>
            </tr>
            <tr>
              <td>
                Exprimés:
                <!--{{ getRatio(exp, votants) }}-->%&nbsp;
              </td>
              <td>Blancs:<!-- {{ getRatio(blancs, votants) }}-->%&nbsp;</td>
              <td>Nuls:<!-- {{ getRatio(nuls, votants) }}-->%</td>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <tr bb-repeat="res: 'candidate'">
              <td>
                <div
                  class="nuance"
                  bb-attr="'background-color: #' + fill(nuance2color[candidate.nuance].toString(16)) + ';' : 'style'"
                ></div>
                <!-- {{ candidate.nom }} -->
              </td>
              <td><!--{{ candidate.nuance }} --></td>
              <td><!--{{ getRatio(candidate.voix, exp) }}-->%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div id="map" style="height: 100%; width: 100%" class="cartes">
      <div class="legend geometry top center hide">
        <div class="wrapper">
          <div class="content"></div>
        </div>
      </div>
      <div class="main-legend hide" style="bottom: 125px">
        <ul>
          <li>
            <span class="color" style="background-color: #b61d1d"></span>Extrême gauche
          </li>
          <li><span class="color" style="background-color: #dc2a1b"></span>PC - LFI</li>
          <li>
            <span class="color" style="background-color: #f19ec7"></span>PS - RDG - DVG
          </li>
          <li><span class="color" style="background-color: #23db23"></span>Écologiste</li>
          <li><span class="color" style="background-color: #d5e4ed"></span>Divers</li>
          <li>
            <span class="color" style="background-color: #d7d7d7"></span>Régionaliste
          </li>
          <li><span class="color" style="background-color: #fed002"></span>REM</li>
          <li><span class="color" style="background-color: #fe9d00"></span>MODEM</li>
          <li>
            <span class="color" style="background-color: #78bce0"></span>UDI - LR - DVD
          </li>
          <li><span class="color" style="background-color: #0089c4"></span>DLF</li>
          <li><span class="color" style="background-color: #83726d"></span>FN</li>
          <li>
            <span class="color" style="background-color: #3e4142"></span>Extrême droite
          </li>
          <li>
            <span class="color" style="background-color: #ffffff"></span>Pas de résultats
          </li>
        </ul>
        <div style="padding: 10px; position: relative">
          <span style="position: absolute; top: 0.8em; left: 0.8em">0%</span>
          <div
            class="scale"
            style="
              border-width: 1px;
              border-style: solid;
              border-color: #bbb;
              height: 1.3em;
              width: 100%;
              background: linear-gradient(
                to right,
                rgba(153, 51, 153, 0),
                rgba(153, 51, 153, 0.6) 30%,
                rgba(153, 51, 153, 1)
              );
            "
          ></div>
          <span style="position: absolute; top: 0.8em; right: 0.8em">100%</span>
        </div>
      </div>
    </div>
    <img
      id="webgl"
      src="img/WebGL_Logo.png"
      style="
        position: absolute;
        top: 20px;
        left: 20px;
        height: 50px;
        z-index: 600;
        pointer-events: none;
        display: none;
      "
    />
  </div>
</template>

<script>
import L, { latLng /* icon */ } from "leaflet";
import { LMap, LTileLayer } from "vue2-leaflet";
import * as PIXI from "pixi.js";
import "leaflet/dist/leaflet.css";
import "leaflet-pixi-overlay";
import axios from "axios";
import * as d3 from "d3";
window.d3 = d3;
import RBush from "rbush";
import Barbiche from "barbiche";
import * as topojson from "topojson-client";
import "./js/example.min.js";
import "./js/tools.min.js";

export default {
  name: "PixiOverlayTeste12",
  props: {
    msg: String,
  },
  components: {
    LMap,
    LTileLayer,
  },
  data() {
    return {
      zoom: 5.2,
      center: latLng(45.079572, 6.857475),
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      withPopup: latLng(44.079572, 6.857475),
      withTooltip: latLng(45.079572, 6.857475),
      currentZoom: 5.2,
      currentCenter: latLng(45.079572, 6.857475),
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
      // patch WebGL PIXI.mesh.MeshRenderer
      var _pixiGlCore2 = PIXI.glCore;
      PIXI.mesh.MeshRenderer.prototype.onContextChange = function onContextChange() {
        var gl = this.renderer.gl;

        this.shader = new PIXI.Shader(
          gl,
          "attribute vec2 aVertexPosition;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n}\n",
          "uniform vec4 uColor;\n\nvoid main(void)\n{\n    gl_FragColor = uColor;\n}\n"
        );
      };

      PIXI.mesh.MeshRenderer.prototype.render = function render(mesh) {
        var renderer = this.renderer;
        var gl = renderer.gl;
        var glData = mesh._glDatas[renderer.CONTEXT_UID];

        if (!glData) {
          renderer.bindVao(null);

          glData = {
            shader: this.shader,
            vertexBuffer: _pixiGlCore2.GLBuffer.createVertexBuffer(
              gl,
              mesh.vertices,
              gl.STREAM_DRAW
            ),
            indexBuffer: _pixiGlCore2.GLBuffer.createIndexBuffer(
              gl,
              mesh.indices,
              gl.STATIC_DRAW
            ),
          };

          // build the vao object that will render..
          glData.vao = new _pixiGlCore2.VertexArrayObject(gl)
            .addIndex(glData.indexBuffer)
            .addAttribute(
              glData.vertexBuffer,
              glData.shader.attributes.aVertexPosition,
              gl.FLOAT,
              false,
              2 * 4,
              0
            );
          mesh._glDatas[renderer.CONTEXT_UID] = glData;
        }

        renderer.bindVao(glData.vao);
        renderer.bindShader(glData.shader);

        glData.shader.uniforms.translationMatrix = mesh.worldTransform.toArray(true);

        glData.shader.uniforms.uColor = PIXI.utils.premultiplyRgba(
          mesh.tintRgb,
          mesh.worldAlpha,
          glData.shader.uniforms.uColor
        );

        glData.vao.draw(gl.TRIANGLE_STRIP, mesh.indices.length, 0);
      };
      //carregador
      const options = {
        responseType: "json",
        transitional: {
          silentJSONParsing: true,
        },
      };
      const response = await axios.get("data/leg-t2.topojson", options);
      var topo = response.data;
      console.log(topo);

      var mainLegend = document.querySelector(".main-legend");
      var API_URL = "//api-adresse.data.gouv.fr";

      var SHORT_CITY_NAMES = [
        "y",
        "ay",
        "bu",
        "by",
        "eu",
        "fa",
        "gy",
        "oo",
        "oz",
        "py",
        "ri",
        "ry",
        "sy",
        "ur",
        "us",
        "uz",
      ];
      /*       var map = L.map("map").setView([46.953387, 2.892341], 6);
      L.tileLayer("//stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png", {
        subdomains: "abcd",
        attribution:
          'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
        minZoom: 2,
        maxZoom: 12,
      }).addTo(map); */

      const vm = this;
      //   var hash = new L.Hash(vm.map);
      vm.map.attributionControl.setPosition("bottomleft");
      vm.map.zoomControl.setPosition("bottomright");

      L.Control.Legend = L.Control.extend({
        onAdd: (map) => {
          var button = L.DomUtil.create("div");
          L.DomUtil.addClass(button, "leaflet-bar leaflet-legend");
          var anchor = L.DomUtil.create("a");
          anchor.setAttribute("href", "#");
          anchor.setAttribute("title", "Légende");
          anchor.setAttribute("role", "button");
          anchor.setAttribute("aria-label", "Légende");
          button.appendChild(anchor);
          L.DomEvent.on(button, "dblclick", function (e) {
            L.DomEvent.stopPropagation(e);
          });
          L.DomEvent.on(button, "click", function (e) {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
            if (L.DomUtil.hasClass(mainLegend, "hide")) {
              L.DomUtil.removeClass(mainLegend, "hide");
            } else L.DomUtil.addClass(mainLegend, "hide");
          });
          return button;
        },
        onRemove: function (map) {},
      });

      L.control.legend = function (opts) {
        return new L.Control.Legend(opts);
      };

      L.control.legend({ position: "bottomright" }).addTo(vm.map);

      var legend = document.querySelector("div.legend.geometry");
      var legendContent = legend.querySelector(".content");
      var pixiLayer = (() => {
        var firstDraw = true;
        var prevZoom;
        var colorScale = d3
          .scaleLinear()
          .domain([0, 50, 100])
          .range(["#c6233c", "#ffd300", "#008000"]);
        var pixiContainer = new PIXI.Graphics();
        var nuance2color = {
          LR: 0x78bce0,
          MDM: 0xfe9d00,
          REM: 0xfed002,
          FN: 0x83726d,
          SOC: 0xf19ec7,
          COM: 0xdc2a1b,
          FI: 0xdc2a1b,
          DVD: 0x78bce0,
          UDI: 0x78bce0,
          DVG: 0xf19ec7,
          DIV: 0xd5e4ed,
          REG: 0xd7d7d7,
          ECO: 0x23db23,
          RDG: 0xf19ec7,
          EXD: 0x3e4142,
          DLF: 0x0089c4,
          EXG: 0xb61d1d,
        };
        var alphaScale = d3.scaleLinear().domain([0, 0.3, 1]).range([0, 0.5, 0.9]);
        var meshAlphaScale = d3.scaleLinear().domain([9, 12]).range([0.6, 1]);
        meshAlphaScale.clamp(true);
        var tree = new RBush();
        function containsPoint(polygon, p) {
          var inside = false,
            part,
            p1,
            p2,
            i,
            j,
            k,
            len,
            len2;
          // ray casting algorithm for detecting if point is in polygon
          for (i = 0, len = polygon.length; i < len; i++) {
            part = polygon[i];

            for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
              p1 = part[j];
              p2 = part[k];

              if (
                p1[1] > p.y !== p2[1] > p.y &&
                p.x < ((p2[0] - p1[0]) * (p.y - p1[1])) / (p2[1] - p1[1]) + p1[0]
              ) {
                inside = !inside;
              }
            }
          }
          return inside;
        }
        var focus = null;
        var barbiche = Barbiche();
        var doubleBuffering =
          /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        var mesh, circMesh;
        return L.pixiOverlay(
          (utils) => {
            var zoom = utils.getMap().getZoom();
            var container = utils.getContainer();
            var renderer = utils.getRenderer();
            var gl = renderer.gl;
            var project = utils.latLngToLayerPoint;
            var scale = utils.getScale();
            var invScale = 1 / scale;
            var self = this;
            if (firstDraw) {
              (() => {
                if (renderer.type === PIXI.RENDERER_TYPE.WEBGL) {
                  gl.blendFunc(gl.ONE, gl.ZERO);
                  document.querySelector("#webgl").style.display = "block";
                } else {
                  document.body.removeChild(document.querySelector("#webgl"));
                }
                topo?.arcs?.forEach(function (arc) {
                  arc.forEach(function (position) {
                    var proj = project([position[1], position[0]]);
                    position[0] = proj.x;
                    position[1] = proj.y;
                  });
                });
                var geojson = topojson.feature(topo, topo?.objects["leg-t2"]);
                var interiors = topojson.mesh(
                  topo,
                  topo?.objects["leg-t2"],
                  function (a, b) {
                    return a !== b && a.properties.ref === b.properties.ref;
                  }
                );
                var circs = topojson.mesh(topo, topo?.objects["leg-t2"], function (a, b) {
                  return a !== b && a.properties.ref !== b.properties.ref;
                });
                topo = null;

                prevZoom = zoom;
                function drawPoly(color, alpha) {
                  return function (poly) {
                    var shape = new PIXI.Polygon(
                      poly[0].map(function (point) {
                        return new PIXI.Point(point[0], point[1]);
                      })
                    );
                    container.beginFill(color, alpha);
                    container.drawShape(shape);
                    if (poly.length > 1) {
                      for (var i = 1; i < poly.length; i++) {
                        var hole = new PIXI.Polygon(
                          poly[i].map(function (point) {
                            return new PIXI.Point(point[0], point[1]);
                          })
                        );
                        container.drawShape(hole);
                        container.addHole();
                      }
                    }
                  };
                }
                geojson.features.forEach(function (feature, index) {
                  var alpha, color;
                  var res = feature.properties && feature.properties.res;
                  if (res != undefined) {
                    color = nuance2color[res.nuance];
                    alpha = alphaScale(res.ratio || 0.5);
                  } else {
                    color = 0xffffff;
                    alpha = 0.8;
                  }
                  var bounds;
                  if (feature.geometry.type === "Polygon") {
                    bounds = L.bounds(feature.geometry.coordinates[0]);
                    drawPoly(color, alpha)(feature.geometry.coordinates);
                  } else if (feature.geometry.type == "MultiPolygon") {
                    feature.geometry.coordinates.forEach(drawPoly(color, alpha));
                    feature.geometry.coordinates.forEach(function (poly, index) {
                      if (index === 0) bounds = L.bounds(poly[0]);
                      else {
                        poly[0].forEach(function (point) {
                          bounds.extend(point);
                        });
                      }
                    });
                  }
                  tree.insert({
                    minX: bounds.min.x,
                    minY: bounds.min.y,
                    maxX: bounds.max.x,
                    maxY: bounds.max.y,
                    feature: feature,
                  });
                });
                geojson = null;

                if (renderer.type === PIXI.RENDERER_TYPE.WEBGL) {
                  (function () {
                    mesh = new PIXI.Container();
                    circMesh = new PIXI.Container();

                    var memo = Object.create(null);
                    var newIndex = 0;
                    var meshVertices = [];
                    var meshIndices = [];
                    var iMax, iMin;
                    function meshCreate(meshVertices, meshIndices, target, color) {
                      var partialMesh = new PIXI.mesh.Mesh(
                        null,
                        new Float32Array(meshVertices),
                        null,
                        new Uint16Array(meshIndices)
                      );
                      partialMesh.tint = color;
                      target.addChild(partialMesh);
                    }
                    function meshCb(polygon) {
                      if (newIndex > 60000) {
                        memo = Object.create(null);
                        meshCreate(meshVertices, meshIndices, mesh, 0x333333);
                        newIndex = 0;
                        meshVertices = [];
                        meshIndices = [];
                      }
                      var indices = polygon.map(function (point) {
                        var key = point[0] + "#" + point[1];
                        var index = memo[key];
                        if (index !== undefined) return index;
                        else {
                          var index2 = (memo[key] = newIndex++);
                          meshVertices.push(point[0], point[1]);
                          return index2;
                        }
                      });
                      iMax = polygon.length - 1;
                      iMin = 0;
                      meshIndices.push(indices[iMax]);
                      while (iMax - iMin >= 2) {
                        meshIndices.push(indices[iMax--], indices[iMin++]);
                      }
                      if (iMax === iMin) {
                        meshIndices.push(indices[iMax], indices[iMax]);
                      } else
                        meshIndices.push(indices[iMax], indices[iMin], indices[iMin]);
                    }

                    function circMeshCb(triangle) {
                      if (newIndex > 60000) {
                        memo = Object.create(null);
                        meshCreate(meshVertices, meshIndices, circMesh, 0);
                        newIndex = 0;
                        meshVertices = [];
                        meshIndices = [];
                      }
                      var indices = triangle.map(function (point) {
                        var key = point[0] + "#" + point[1];
                        var index = memo[key];
                        if (index !== undefined) return index;
                        else {
                          var index2 = (memo[key] = newIndex++);
                          meshVertices.push(point[0], point[1]);
                          return index2;
                        }
                      });
                      iMax = triangle.length - 1;
                      iMin = 0;
                      meshIndices.push(indices[iMax]);
                      while (iMax - iMin >= 2) {
                        meshIndices.push(indices[iMax--], indices[iMin++]);
                      }
                      if (iMax === iMin) {
                        meshIndices.push(indices[iMax], indices[iMax]);
                      } else
                        meshIndices.push(indices[iMax], indices[iMin], indices[iMin]);
                    }

                    var point2index = {};
                    var vertices = [];
                    var edges = [];
                    interiors.coordinates.forEach(function (arc) {
                      arc.forEach(function (point, index) {
                        var key = point[0] + "#" + point[1];
                        var indexTo;
                        if (!(key in point2index)) {
                          indexTo = point2index[key] = vertices.length;
                          vertices.push(point);
                        } else {
                          indexTo = point2index[key];
                        }
                        if (index > 0) {
                          var prevPoint = arc[index - 1];
                          var indexFrom = point2index[prevPoint[0] + "#" + prevPoint[1]];
                          if (indexFrom !== indexTo) edges.push([indexTo, indexFrom]);
                        }
                      });
                    });
                    graphDraw(
                      { vertices: vertices, edges: edges },
                      2 / utils.getScale(12),
                      meshCb,
                      Math.PI
                    );
                    meshCreate(meshVertices, meshIndices, mesh, 0x333333);
                    memo = Object.create(null);
                    newIndex = 0;
                    meshVertices = [];
                    meshIndices = [];

                    var point2index2 = {};
                    var vertices2 = [];
                    var edges2 = [];
                    circs.coordinates.forEach(function (arc) {
                      arc.forEach(function (point, index) {
                        var key = point[0] + "#" + point[1];
                        var indexTo;
                        if (!(key in point2index2)) {
                          indexTo = point2index2[key] = vertices2.length;
                          vertices2.push(point);
                        } else {
                          indexTo = point2index2[key];
                        }
                        if (index > 0) {
                          var prevPoint = arc[index - 1];
                          var indexFrom = point2index2[prevPoint[0] + "#" + prevPoint[1]];
                          edges2.push([indexTo, indexFrom]);
                        }
                      });
                    });
                    graphDraw(
                      { vertices: vertices2, edges: edges2 },
                      6 / utils.getScale(12),
                      circMeshCb,
                      Math.PI
                    );
                    meshCreate(meshVertices, meshIndices, circMesh, 0);
                  })();
                } else {
                  mesh = new PIXI.Graphics();
                  mesh.lineStyle(2 / utils.getScale(12), 0x333333, 1);
                  interiors.coordinates.forEach(function (path) {
                    path.forEach(function (point, index) {
                      if (index === 0) mesh.moveTo(point[0], point[1]);
                      else mesh.lineTo(point[0], point[1]);
                    });
                  });
                  circMesh = new PIXI.Graphics();
                  circMesh.lineStyle(6 / utils.getScale(12), 0x000000, 1);
                  circs.coordinates.forEach(function (path) {
                    path.forEach(function (point, index) {
                      if (index === 0) circMesh.moveTo(point[0], point[1]);
                      else circMesh.lineTo(point[0], point[1]);
                    });
                  });
                }
                interiors = null;
                circs = null;

                container.addChild(mesh);
                container.addChild(circMesh);

                function findFeature(latlng) {
                  var point = project(latlng);
                  var features = tree.search({
                    minX: point.x,
                    minY: point.y,
                    maxX: point.x,
                    maxY: point.y,
                  });
                  for (var i = 0; i < features.length; i++) {
                    var feat = features[i].feature;
                    if (feat.geometry.type === "Polygon") {
                      if (containsPoint(feat.geometry.coordinates, point)) return feat;
                    } else {
                      for (var j = 0; j < feat.geometry.coordinates.length; j++) {
                        var ring = feat.geometry.coordinates[j];
                        if (containsPoint(ring, point)) return feat;
                      }
                    }
                  }
                }
                async function focusFeature(feat) {
                  if (focus) focus.removeFrom(utils.getMap());
                  if (feat) {
                    if (feat.properties.res) {
                      focus = L.geoJSON(feat, {
                        coordsToLatLng: utils.layerPointToLatLng,
                        style: function (feature) {
                          return {
                            fillColor: "#fff",
                            fillOpacity: 0.7,
                            stroke: false,
                          };
                        },
                        interactive: false,
                      });
                      focus.addTo(utils.getMap());
                      var dpt = feat.properties.ref.substring(0, 3);
                      var response2 = await axios.get(
                        "data/leg-t2/" +
                          dpt +
                          "/" +
                          feat.properties.ref +
                          feat.properties.city +
                          ".json"
                      );
                      var data = response2;
                      /*   var merged = barbiche("details").merge(
                        {
                          nuance2color: nuance2color,
                          getRatio: function (a, b) {
                            return Math.round((a * 10000) / b) / 100;
                          },
                          fill: function (str) {
                            if (str.length < 6) {
                              return new Array(6 - str.length + 1).join("0") + str;
                            } else return str;
                          },
                        },
                        data
                      ); */
                      legendContent.innerHTML = "";
                      // legendContent.appendChild(merged);
                      L.DomUtil.removeClass(legend, "hide");
                    } else {
                      focus = null;
                      L.DomUtil.addClass(legend, "hide");
                    }
                  } else {
                    focus = null;
                    L.DomUtil.addClass(legend, "hide");
                  }
                }
                utils.getMap().on("click", function (e) {
                  var feat = findFeature(e.latlng);
                  focusFeature(feat);
                });
                utils.getMap().on(
                  "mousemove",
                  L.Util.throttle(function (e) {
                    var feat = findFeature(e.latlng);
                    if (feat && feat.properties.res) {
                      console.log("Teste1");
                      //  L.DomUtil.addClass(self._container, "leaflet-interactive");
                    } else {
                      //  L.DomUtil.removeClass(self._container, "leaflet-interactive");
                      console.log("Teste2");
                    }
                  }, 32)
                );
                legendContent.addEventListener("click", function (e) {
                  e.stopPropagation();
                  var target = e.target;
                  if (L.DomUtil.hasClass(target, "close")) {
                    focus.removeFrom(utils.getMap());
                    focus = null;
                    L.DomUtil.addClass(legend, "hide");
                  }
                });
                L.control
                  .photon({
                    url: API_URL + "/search/?type=municipality&&",
                    placeholder: "Rechercher une commune",
                    position: "topright",
                    minChar: function (val) {
                      return SHORT_CITY_NAMES.indexOf(val) !== -1 || val.length >= 3;
                    },
                    feedbackEmail: null,
                    noResultLabel: "Aucun résultat",
                    formatResult: function (feature, el) {
                      var title = L.DomUtil.create("strong", "", el);
                      var content = feature.properties.label || feature.properties.name;
                      if (feature.properties.postcode)
                        content += "(" + feature.properties.postcode + ")";
                      title.innerHTML = content;
                    },
                    onSelected: function (feature) {
                      var latlng = [
                        feature.geometry.coordinates[1],
                        feature.geometry.coordinates[0],
                      ];
                      var code = feature.properties.citycode;
                      var point = project(latlng);
                      var epsilon = 35;
                      var features = tree.search({
                        minX: point.x - epsilon,
                        minY: point.y - epsilon,
                        maxX: point.x + epsilon,
                        maxY: point.y + epsilon,
                      });
                      var feat;
                      features.every(function (item) {
                        var insee;
                        var ref = item.feature.properties.ref;
                        if (ref[0] === "9") {
                          insee = ref.substring(0, 2) + item.feature.properties.city;
                        } else {
                          insee = ref.substring(1, 3) + item.feature.properties.city;
                        }
                        if (insee === code) {
                          feat = item.feature;
                          return false;
                        } else return true;
                      });
                      focusFeature(feat);
                      utils.getMap().setView(latlng, 12);
                    },
                  })
                  .addTo(utils.getMap());
              })();
            }
            firstDraw = false;
            mesh.visible = zoom >= 9;
            mesh.alpha = meshAlphaScale(zoom);
            circMesh.alpha = meshAlphaScale(zoom);
            prevZoom = zoom;
            renderer.render(container);
          },
          pixiContainer,
          {
            doubleBuffering: doubleBuffering,
            destroyInteractionManager: true,
          }
        );
      })();
      //adiciona a sobreposição no mapa de referencia
      pixiLayer.addTo(vm.map);
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
