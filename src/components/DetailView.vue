<template>
  <div class="detailview">
    <div 
      v-for="field in fields" 
      :key="field.path"
      class="detailview__item">
      <div class="detailview__label">{{ field.path }}</div>
      <DetailValue 
        :field="field" 
        @change="setProperty(field.path, $event)"/>
    </div>
  </div>
</template>

<script>
import { Observable } from "rxjs/Observable";
import DetailValue from "./DetailValue.vue";
import lastestInspector$ from "../services/lastestInspector$.js";

const POLL_INTERVAL = 567; // Weird interval to be sure to be out of sync with a looping animation.

export default {
  components: { DetailValue },

  subscriptions() {
    return {
      fields: lastestInspector$.switchMap(inspector => {
        if (inspector === null) {
          return Observable.empty();
        }
        return Observable.interval(POLL_INTERVAL)
          .merge(inspector.selected$)
          .switchMap(() => inspector.call("properties.all"));
      }),
      setProperty: lastestInspector$.method("setProperty")
    };
  }
};
</script>

<style lang="scss">
.detailview {
  // white-space: nowrap;
  padding: 4px;
}

.detailview__item {
  display: flex;
  margin-bottom: 2px;
}

.detailview__label {
  display: inline-block;
  color: #c80000;
  padding-right: 5px;
  &:after {
    content: ":";
    color: #000;
  }
  .dark-mode & {
    color: #35d4c7;
  }
}
</style>
