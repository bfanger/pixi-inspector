import { log } from "./services/config";
import "./common";
import Vue from "vue";
import VueRx from "vue-rx";
import PixiPanel from "./components/PixiPanel.vue";
import "./bootstrap.scss";
import Observable from "rxjs/Observable";
import Subscription from "rxjs/Subscription";
import Subject from "rxjs/Subject";

log.info("pixi.panel");

if (chrome.extension) {
  Vue.config.devtools = false;
}
if (chrome.extension || process.env.DEV_SERVER) {
  Vue.config.productionTip = false;
}
Vue.use(VueRx, { Observable, Subscription, Subject });

const vm = new Vue(PixiPanel);
vm.$mount("pixi-panel");
