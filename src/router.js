import Vue from "vue";
import Router from "vue-router";
import HelloWorld from "./components/HelloWorld.vue";
import PixiOverlay from "./components/PixiOverlay.vue";
//import PixiOverlayMarkers from "./components/PixiOverlayMarkers.vue";
import PixiOverlayTeste2 from "./components/PixiOverlayTeste2.vue";

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: "/helloworld",
            name: "home",
            component: HelloWorld
        },
        /*   {
              path: "/PixiOverlayMarkers",
              name: "PixiOverlayMarkers",
              component: PixiOverlayMarkers
          }, */
        {
            path: "/PixiOverlayTeste2",
            name: "pixioverlayteste2",
            component: PixiOverlayTeste2
        },
        {
            path: "/pixioverlay",
            name: "pixioverlay",
            component: PixiOverlay
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            /*  component: () =>
                  import( webpackChunkName: "about"  "./views/About.vue")*/
        }
    ]
});