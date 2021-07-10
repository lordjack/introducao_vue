import Vue from "vue";
import Router from "vue-router";
import HelloWorld from "./components/HelloWorld.vue";
import PixiOverlay from "./components/PixiOverlay.vue";
import PixiOverlayBezierEasing from "./components/PixiOverlayBezierEasing.vue";
//import PixiOverlayMarkers from "./components/PixiOverlayMarkers.vue";
/* import PixiOverlayTeste2 from "./components/PixiOverlayTeste2.vue";
import PixiOverlayTeste3 from "./components/PixiOverlayTeste3.vue"; */
import PixiOverlayTeste4 from "./components/PixiOverlayTeste4.vue";
import PixiOverlayTeste5 from "./components/PixiOverlayTeste5.vue";
import PixiOverlayTeste6 from "./components/PixiOverlayTeste6.vue";
import PixiOverlayTeste7 from "./components/PixiOverlayTeste7.vue";
import PixiOverlayTeste8 from "./components/PixiOverlayTeste8.vue";
import PixiOverlayTeste9 from "./components/PixiOverlayTeste9.vue";
import PixiOverlayTeste10 from "./components/PixiOverlayTeste10.vue";
import PixiOverlayTeste11 from "./components/PixiOverlayTeste11.vue";
import PixiOverlayTeste12 from "./components/PixiOverlayTeste12.vue";

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: "/helloworld",
            name: "home",
            component: HelloWorld
        },
        {
            path: "/PixiOverlayBezierEasing",
            name: "bezier-easing",
            component: PixiOverlayBezierEasing
        },
        /*   {
              path: "/PixiOverlayMarkers",
              name: "PixiOverlayMarkers",
              component: PixiOverlayMarkers
          }, */
        /*      {
                 path: "/PixiOverlayTeste2",
                 name: "pixioverlayteste2",
                 component: PixiOverlayTeste2
             },
             {
                 path: "/PixiOverlayTeste3",
                 name: "pixioverlayteste3",
                 component: PixiOverlayTeste3
             },
      */
        {
            path: "/PixiOverlayTeste4",
            name: "pixioverlayteste4",
            component: PixiOverlayTeste4
        },
        {
            path: "/PixiOverlayTeste5",
            name: "pixioverlayteste5",
            component: PixiOverlayTeste5
        },
        {
            path: "/PixiOverlayTeste6",
            name: "pixioverlayteste6",
            component: PixiOverlayTeste6
        },
        {
            path: "/PixiOverlayTeste7",
            name: "pixioverlayteste7",
            component: PixiOverlayTeste7
        },
        {
            path: "/PixiOverlayTeste8",
            name: "pixioverlayteste8",
            component: PixiOverlayTeste8
        },
        {
            path: "/PixiOverlayTeste9",
            name: "pixioverlayteste9",
            component: PixiOverlayTeste9
        },
        {
            path: "/PixiOverlayTeste10",
            name: "pixioverlayteste10",
            component: PixiOverlayTeste10
        },
        {
            path: "/PixiOverlayTeste11",
            name: "pixioverlayteste11",
            component: PixiOverlayTeste11
        },
        {
            path: "/PixiOverlayTeste12",
            name: "pixioverlayteste12",
            component: PixiOverlayTeste12
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