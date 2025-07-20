<script lang="ts">
  type Props = {
    label?: string;
    hint?: string;
    group?: boolean;
    children?: import("svelte").Snippet;
  };

  let { label = "", hint = "", group = false, children }: Props = $props();
</script>

<div class="property" class:group>
  <div class="label" title={hint}>{label}</div>
  <div class="value">
    {@render children?.()}
  </div>
</div>

<style>
  .property {
    display: flex;
    gap: 8px;

    &:not(:global(.group)) {
      margin-bottom: 4px;
    }
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
