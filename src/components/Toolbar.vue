<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="toolbar">
    <slot />
  </div>
</template>

<style lang="scss">
.toolbar {
  border-bottom: 1px solid #dadada;
  color: #5a5a5a;
  padding: 3px 5px;
  .dark-mode & {
    border-color: #494c50;
    background-color: #292a2d;
    color: #979da2;
  }
}
</style>
