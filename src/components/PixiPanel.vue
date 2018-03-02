<template>
  <div class="pixi-panel" :class="{'dark-mode': darkMode}">
    <Toolbar>
      <!-- <Toggle icon="node-search" v-if="isConnected" :value="selectMode" @change="toggleSelectMode" title="Select a node in the scene to inspect it"></Toggle> -->
      <button @click="reload">Reconnect</button>
      <div class="pixi-panel__search">
        <span class="pixi-panel__search__counter" v-if="searchCounter">{{ searchCounter }} found</span>
        <input required v-model="searchKey" class="pixi-panel__search__input" title="search" placeholder="Search"/>
        <span @click="clearSearch" class="pixi-panel__search--clear"></span>
      </div>
    </Toolbar>
    <SplitView class="pixi-panel__body" v-if="injected">
      <TreeView :search-key="searchKey" :search-cnt="searchCounter" @updateSearchCnt="updateSearchCnt"></TreeView>
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
  data: {
    searchKey: '',
    searchCounter: 0
  },
  methods: {
    toggleSelectMode (value) {
      this.selectModeSubscription = this.inspector$
        .first()
        .subscribe(inspector => {
          inspector.selectMode(value)
        })
    },
    updateSearchCnt (value) {
        this.searchCounter = value;
    },
    clearSearch () {
      this.searchKey = '';
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

.pixi-panel__search {
    min-width: 185px;
    position: absolute;
    right: 5px;
    top: 0;
}

.pixi-panel__search__counter {
    font-size: 14px;
}

.pixi-panel__search__input {
    border: 1px solid #ccc;
    outline: 0;
    border-radius: 15px;
    padding: 5px;
    padding-left: 10px;
}

.pixi-panel__search__input:not(:valid) ~ .pixi-panel__search--clear {
    display: none;
}

.pixi-panel__search--clear {
    position: absolute;
    right: 0;
    top: 0;
    padding: 3px;
    bottom: 0;
    border:1px solid transparent;
    background-color: transparent;
    display: inline-block;
    vertical-align: middle;
    outline: 0;
    cursor: pointer;
}

.pixi-panel__search--clear:after {
    content: "X";
    display: block;
    width: 15px;
    height: 15px;
    background-color: #FA9595;
    z-index:1;
    margin: auto;
    padding: 2px;
    border-radius: 50%;
    text-align: center;
    color: white;
    font-weight: normal;
    font-size: 12px;
    box-shadow: 0 0 2px #E50F0F;
    cursor: pointer;
}
</style>
