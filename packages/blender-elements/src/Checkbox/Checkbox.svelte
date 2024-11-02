<script lang="ts">
  type Props = {
    value?: boolean | undefined;
    hint?: string;
    children?: import("svelte").Snippet;
    onchange?: (value: boolean) => void;
  };

  let {
    value = $bindable(undefined),
    hint = "",
    children,
    onchange,
  }: Props = $props();

  function onChange(e: Event) {
    const el = e.target as HTMLInputElement;
    onchange?.(el.checked);
  }
</script>

<label class="checkbox" title={hint}>
  <input
    class="input"
    type="checkbox"
    bind:checked={value}
    onchange={onChange}
    onclick={(e) => e.stopPropagation()}
  />
  {#if children}
    <span>{@render children?.()}</span>
  {/if}
</label>

<style>
  .checkbox {
    display: flex;
    gap: 2px;
    color: white;
    align-items: center;
    user-select: none;
    font:
      12px system-ui,
      sans-serif;
    cursor: pointer;
  }
  .input {
    outline: none;
    appearance: none;
    background: #545454;
    border: 1px solid #3d3d3d;
    border-radius: 3px;
    box-shadow: 0 1px 1px rgba(black, 0.2);
    width: 14px;
    height: 14px;
    margin: 0;

    &:hover {
      background: #656565;
      border-color: #464646;
    }
    &:checked {
      background: #4772b3 var(--icon-checkbox) no-repeat center center;
    }
    &:focus-visible {
      border-color: #4772b3;
      &:checked {
        border-color: white;
      }
    }
  }
</style>
