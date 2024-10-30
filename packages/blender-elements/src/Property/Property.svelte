<script lang="ts">
  export let label = "";
  export let hint = "";
  export let group = false;
</script>

<div class="property" class:group>
  <div class="label" title={hint}>{label}</div>
  <div class="value">
    <slot />
  </div>
</div>

<style>
  .property {
    display: flex;
    gap: 8px;

    &:not(.group) {
      margin-bottom: 4px;
    }
  }
  .label {
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .value {
    flex: 2;
  }
</style>
