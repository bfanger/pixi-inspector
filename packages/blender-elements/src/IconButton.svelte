<script lang="ts">
  import type { Icon } from "./icons";

  type Props = {
    icon: Icon;
    muted?: boolean;
    hint?: string | undefined;
    onclick: () => void;
  };

  let { icon, muted = false, hint = undefined, onclick }: Props = $props();
</script>

<button
  class="toggle"
  class:muted
  style="background-image: var(--icon-{icon})"
  title={hint}
  onclick={(e) => {
    e.stopPropagation();
    onclick?.();
  }}
  ondblclick={(e) => e.stopPropagation()}
  aria-label="toggle"
></button>

<style>
  .toggle {
    appearance: none;
    background: transparent no-repeat center center;
    border: none;
    width: 20px;
    height: 20px;
    opacity: 0.6;
    flex-shrink: 0;
    cursor: pointer;

    &:active,
    &:hover {
      opacity: 0.8;
    }
    &.muted {
      opacity: 0.3;
    }
  }
</style>
