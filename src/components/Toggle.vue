<template>
  <span
    :class="{ toggle: true, 'toggle--on': value, 'toggle--off': !value }"
    @click="$emit('change', !value)"
  >
    <span
      :class="['toggle__icon', 'toggle__icon--' + icon]"
      :title="title"
      :style="
        icon === 'node-search'
          ? `-webkit-mask-size: 16px 16px; -webkit-mask-image: url('${maskSrc}')`
          : ''
      "
    />
  </span>
</template>

<script>
import maskSrc from "../../img/select-to-inspect.png";

export default {
  props: {
    value: { type: Boolean, required: true },
    title: { type: String, required: true },
    icon: { type: String, required: true },
  },
  data: () => ({
    maskSrc,
  }),
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
  .toggle--on & {
    background: rgb(66, 129, 235);
  }
  .toggle--off & {
    background: #5a5a5a;
  }
}
</style>
