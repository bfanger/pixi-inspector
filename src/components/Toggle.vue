<template>
  <span
    :class="{ toggle: true, 'toggle--on': value, 'toggle--off': !value }"
    @click="$emit('change', !value)"
  >
    <span :class="['toggle__icon', 'toggle__icon--' + icon]" :title="title" />
  </span>
</template>

<script>
export default {
  props: {
    value: { type: Boolean, required: true },
    title: { type: String, required: true },
    icon: { type: String, required: true },
  },
};
</script>

<style lang="scss">
.toggle {
  display: inline-block;
  padding: 2px;
}

.toggle__icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  -webkit-mask-size: 16px 16px;
  .toggle--on & {
    background: rgb(66, 129, 235);
  }
  .toggle--off & {
    background: #5a5a5a;
  }
}

.toggle__icon--node-search {
  -webkit-mask-image: url(../../img/select-to-inspect.png);
}
</style>
