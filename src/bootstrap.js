import Vue from 'vue'
import VueRx from 'vue-rx'
import PixiPanel from "./components/PixiPanel";
import './bootstrap.scss'
import Observable from 'rxjs/Observable'
import Subscription from 'rxjs/Subscription'

// import('../pixi.inspector') // Enable for live reload

Vue.use(VueRx, { Observable, Subscription})

const vm = new Vue(PixiPanel)
vm.$mount('#devpanel')