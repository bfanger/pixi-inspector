<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    icon?: "warning" | "error";
    message?: string;
    children?: Snippet;
  };

  let { icon = "warning", message = "", children }: Props = $props();
</script>

<div class="warning" data-icon={icon}>
  {message}{@render children?.()}
</div>

<style>
  .warning {
    position: relative;

    overflow: hidden;

    min-height: 16px;
    padding: 2px 4px 4px 30px;
    border: 1px solid #3d3d3d;
    border-radius: 3px;

    color: #e1e1e1;

    background: #472722;

    &::before {
      content: "";

      position: absolute;
      top: 0;
      left: 0;

      width: 24px;
      height: 100%;

      background: #c1432a center center no-repeat;
    }

    &[data-icon="warning"]::before {
      background-image: var(--icon-warning);
    }

    &[data-icon="error"]::before {
      background-image: var(--icon-error);
    }
  }
</style>
