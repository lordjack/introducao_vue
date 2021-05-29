import Vue from "vue";
import Router from "vue-router";
import HelloWorld from "./components/HelloWorld.vue";
import PixiOverlay from "./components/PixiOverlay.vue";

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: "/helloworld",
            name: "home",
            component: HelloWorld
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