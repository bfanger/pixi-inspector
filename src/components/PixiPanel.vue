<template>
  <div class="pixi-panel">
    <Toolbar>
      <Toggle icon="node-search"
              :value="selectMode"
              @change="toggleSelectMode"
              title="Select a node in the scene to inspect it"></Toggle>
      <a @click="reboot">reconnect</a>
    </Toolbar>
    <div class="pixi-panel__message"
         v-if="!isDetected">
      Looking for PixiJS ...
    </div>
    <div class="pixi-panel__message"
         v-if="isDetected && !isConnected">
      Connecting to PixiJS ...
    </div>
    <SplitView class="pixi-panel__body">
      <TreeView :scene="scene"
                :inspector="inspector"
                v-if="scene"></TreeView>
      <DetailView :selected="selected"
                  :proxy="inspector.proxy"
                  v-if="selected"></DetailView>
    </SplitView>
  </div>
</template>

<script>
import { Observable } from 'rxjs/Observable'
import Toolbar from './Toolbar'
import Toggle from './Toggle'
import SplitView from './SplitView'
import TreeView from './TreeView'
import DetailView from './DetailView'
import reboot$ from '../services/reboot$'
import detectPixi$ from '../services/detectPixi$'
import connection from '../services/connection'
// import injectInspector from '../services/injectInspector'

export default {
  components: { Toolbar, Toggle, SplitView, TreeView, DetailView },
  data: () => ({
    isDetected: false,
    isConnected: false,
    selectMode: false,
    scene: null,
    selected: null,
    inspector: null
  }),
  mounted () {
    this.inspector$ = reboot$.startWith('initial').switchMap(() => {
      this.isDetected = false
      this.isConnected = false
      this.scene = null
      this.selected = null
      // const contentDisconnect$ = connection.message$.filter(message => message.command === 'DISCONNECTED')
      // contentDisconnect$.subscribe(message => {
      //   console.log(message)
      // })
      return detectPixi$.switchMap(config => {
        console.log('config', config)
        this.isDetected = true
        // return injectInspector(config).takeUntil(contentDisconnect$.filter(message => message.frameId === config.frameId))
      }).do(() => {
        this.isConnected = true
      })
    }).do(inspector => {
      this.inspector = inspector
    }).catch(error => {
      console.error(error)
      reboot$.next('error')
      return Observable.empty()
    }).publishReplay(1).refCount()

    this.$subscribeTo(this.inspector$.switchMap(inspector => {
      // return Observable.empty()
      return Observable.interval(500).map(() => inspector.refresh$)
    }), refresh$ => {
      refresh$.next('interval')
    })
    const scene$ = this.inspector$.switchMap(inspector => inspector.scene$)
    this.$subscribeTo(scene$, scene => {
      // console.log(scene)
      this.selectMode = scene.selectMode
      this.selected = scene.selected
      this.scene = scene
    })
  },
  methods: {
    toggleSelectMode (value) {
      this.selectModeSubscription = this.inspector$.first().subscribe(inspector => {
        inspector.selectMode(value)
      })
    },
    reboot () {
      window.location.reload()
    }
  }

  // },
  // componentDidMount() {
  // this.subscriptions = [
  //   scene.subscribe((_scene) => {
  //   this.setState(_scene)
  //   }, error => {
  //   proxy.eval('typeof window.__PIXI_INSPECTOR_GLOBAL_HOOK1__').then(function (type) {
  //     if (type === 'object') {
  //     console.error(error)
  //     } else { // page refresh?
  //     location.reload()
  //     }
  //   })
}
</script>

<style lang="scss">
.pixi-panel {
  cursor: default;
  font-size: 11px !important;
  font-family: Menlo, monospace;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
}

.pixi-panel__message {
  height: 100%;
  font-size: 24px;
  color: rgb(75%, 75%, 75%);
  font-weight: bold;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pixi-panel__body {
  flex-grow: 1;
}
</style>
