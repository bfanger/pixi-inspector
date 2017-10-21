<template>
  <div class="pixi-panel" :class="{'dark-mode': darkMode}">
    <Toolbar>
      <!-- <Toggle icon="node-search" v-if="isConnected" :value="selectMode" @change="toggleSelectMode" title="Select a node in the scene to inspect it"></Toggle> -->
      <button @click="reload">Reconnect</button>
    </Toolbar>
    <SplitView class="pixi-panel__body" v-if="injected">
      <TreeView></TreeView>
      <DetailView></DetailView>
    </SplitView>
    <div class="pixi-panel__message" v-if="!injected && messageVisible">
      Looking for
      <span class="pixi-panel__inline-logo">pixijs</span> ...
      <!-- <button v-if="instance === null" @click="detect">Retry</button> -->
    </div>
  </div>
</template>

<script>
import { Observable } from 'rxjs/Observable'
import Toolbar from './Toolbar'
import Toggle from './Toggle'
import SplitView from './SplitView'
import TreeView from './TreeView'
import DetailView from './DetailView'
import connection from '../services/connection'
import active$ from '../services/active$'
import lastestInspector$ from '../services/lastestInspector$'

export default {
  components: { Toolbar, Toggle, SplitView, TreeView, DetailView },
  computed: {
    darkMode () {
      return (
        typeof chrome !== 'undefined' &&
        typeof chrome.devtools !== 'undefined' &&
        typeof chrome.devtools.panels !== 'undefined' &&
        chrome.devtools.panels.themeName === 'dark'
      )
    }
  },
  subscriptions () {
    return {
      injected: lastestInspector$.map(inspector => inspector !== null),
      messageVisible: active$.switchMap(active => {
        if (active) {
          return Observable.timer(100)
            .map(() => true)
            .startWith(false)
        }
        return Observable.of(false)
      })
    }
  },
  methods: {
    toggleSelectMode (value) {
      this.selectModeSubscription = this.inspector$
        .first()
        .subscribe(inspector => {
          inspector.selectMode(value)
        })
    },
    reload () {
      window.location.reload()
    },
    detect () {
      connection.to('content_scripts').send('DETECT')
    }
  }
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
  color: #222;
}

.dark-mode {
    color: #bdc6cf;
}

.pixi-panel__body {
  flex-grow: 1;
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

.pixi-panel__inline-logo {
  display: inline-block;
  background: url(../../img/pixijs.png) no-repeat;
  background-size: contain;
  color: transparent;
  width: 86px;
  height: 31px;
  margin-left: 15px;
  margin-right: 10px;
  margin-top: -5px;
}
</style>
