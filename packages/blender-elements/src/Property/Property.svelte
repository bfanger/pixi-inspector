<script lang="ts">
  type Props = {
    label?: string;
    hint?: string;
    children?: import("svelte").Snippet;
  };

  let { label = "", hint = "", children }: Props = $props();
</script>

<div class="property">
  <div class="label" title={hint}>{label}</div>
  <div class="value">
    {@render children?.()}
  </div>
</div>

<style>
  .property {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .label {
    user-select: none;

    overflow: hidden;
    flex: 1;

    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .value {
    flex: 2;
  }
</style>
