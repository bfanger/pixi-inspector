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
    cursor: pointer;

    flex-shrink: 0;

    width: 20px;
    height: 20px;
    border: none;

    appearance: none;
    opacity: 0.6;
    background: transparent no-repeat center center;

    &:active,
    &:hover {
      opacity: 0.8;
    }

    &.muted {
      opacity: 0.3;
    }
  }
</style>
