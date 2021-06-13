import 'babel-polyfill';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import Vue from 'vue';
import App from './App.vue';
import router from './router';
//import devtools from '@vue/devtools'

Vue.config.productionTip = false;

new Vue({
  router,
  //store,
  render: (h) => h(App),
}).$mount('#app');
