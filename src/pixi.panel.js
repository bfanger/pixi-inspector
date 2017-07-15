console.info('pixi.panel')

import './common'
import Vue from 'vue'
import VueRx from 'vue-rx'
import PixiPanel from './components/PixiPanel'
import './bootstrap.scss'
import Observable from 'rxjs/Observable'
import Subscription from 'rxjs/Subscription'
import Subject from 'rxjs/Subject'

if (chrome.extension) {
  Vue.config.productionTip = false
  Vue.config.devtools = false
}
Vue.use(VueRx, { Observable, Subscription, Subject })

const vm = new Vue(PixiPanel)
vm.$mount('pixi-panel')
