<template>
  <div :class="{ 'dark-mode': darkMode }" class="pixi-panel">
    <Toolbar>
      <button @click="reload">Reconnect</button>
      <input
        v-model="search"
        class="pixi-panel__search"
        type="search"
        placeholder="Find by name"
        @keyup.enter="searchFilter(search)"
      />
    </Toolbar>
    <SplitView v-if="injected" class="pixi-panel__body">
      <TreeView :search="search" />
      <DetailView />
    </SplitView>
    <div v-if="!injected && messageVisible" class="pixi-panel__message">
      Looking for
      <span class="pixi-panel__inline-logo">pixijs</span> ...
    </div>
  </div>
</template>

<script>
import { of, timer } from "rxjs";
import Toolbar from "./Toolbar.vue";
import SplitView from "./SplitView.vue";
import TreeView from "./TreeView.vue";
import DetailView from "./DetailView.vue";
import connection from "../services/connection";
import active$ from "../services/active$";
import latestInspector$ from "../services/latestInspector$";
import { map, switchMap, startWith } from "rxjs/operators";

export default {
  components: { Toolbar, SplitView, TreeView, DetailView },
  data() {
    return {
      search: "",
    };
  },
  computed: {
    darkMode() {
      return (
        typeof chrome !== "undefined" &&
        typeof chrome.devtools !== "undefined" &&
        typeof chrome.devtools.panels !== "undefined" &&
        chrome.devtools.panels.themeName === "dark"
      );
    },
  },
  subscriptions() {
    return {
      injected: latestInspector$.pipe(map((inspector) => inspector !== null)),
      messageVisible: active$.pipe(
        switchMap((active) => {
          if (active) {
            return timer(100).pipe(
              map(() => true),
              startWith(false)
            );
          }
          return of(false);
        })
      ),
      searchFilter: latestInspector$.method("searchFilter"),
    };
  },
  methods: {
    toggleSelectMode(value) {
      this.selectModeSubscription = this.inspector$
        .first()
        .subscribe((inspector) => {
          inspector.selectMode(value);
        });
    },
    reload() {
      window.location.reload();
    },
    detect() {
      connection.to("content_scripts").send("DETECT");
    },
  },
};
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
  height: calc(100% - 28px); // minus toolbar height
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
  border: 1px solid #d8d8d8;
  padding: 2px 3px 1px 3px;
  border-radius: 2px;
  font: 12px ".SFNSDisplay-Regular", "Helvetica Neue", "Lucida Grande",
    sans-serif;
  &:focus {
    outline: none;
  }
}
</style>
