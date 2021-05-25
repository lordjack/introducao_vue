import * as PIXI from 'pixi.js';
import 'leaflet-pixi-overlay';

new Vue({
    methods: {
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

                pixiOverlay.addTo(this.map)
            })
        }
    },

    mounted() {
        this.map = L.map(this.$refs.map).setView([51.505, -0.09], 13)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
        }).addTo(this.map)

        this.draw()
    }
}).$mount('#app')


/*   var app = new Vue({
            el: '#app',
            data: {
                message: 'Hello Vue!'
            }
        }) */