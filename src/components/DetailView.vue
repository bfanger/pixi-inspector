<template>
  <div class="detailview">
    <div v-for="field in fields" :key="field.path" class="detailview__item">
      <div class="detailview__label">{{ field.path }}</div>
      <DetailValue :field="field" @change="setProperty(field.path, $event)" />
    </div>
    <button @click="logToConsole">Log to console</button>
  </div>
</template>

<script>
import { empty, interval } from "rxjs";
import { switchMap, merge, map } from "rxjs/operators";
import DetailValue from "./DetailValue.vue";
import latestInspector$ from "../services/latestInspector$.js";

const POLL_INTERVAL = 567; // Weird interval to be sure to be out of sync with a looping animation.

export default {
  components: { DetailValue },

  subscriptions() {
    return {
      fields: latestInspector$.pipe(
        switchMap((inspector) => {
          if (inspector === null) {
            return empty();
          }
          return interval(POLL_INTERVAL).pipe(
            merge(inspector.selected$),
            switchMap(() => inspector.call("properties.all")),
            map((fields) => {
              // Remove duplicates
              const exists = {};
              return fields.reduce((acc, item) => {
                if (exists[item.path]) {
                  return acc;
                }
                exists[item.path] = true;
                return [...acc, item];
              }, []);
            })
          );
        })
      ),
      setProperty: latestInspector$.method("setProperty"),
      logToConsole: latestInspector$.method("logToConsole"),
    };
  },
};
</script>

<style lang="scss">
.detailview {
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
