<script lang="ts">
  type Props = {
    value?: boolean | undefined;
    setValue?: (value: boolean) => void;
    label?: string;
    hint?: string;
    children?: import("svelte").Snippet;
  };

  let {
    value = $bindable(undefined),
    label,
    hint,
    children,
    setValue,
  }: Props = $props();
</script>

<label class="checkbox" title={hint}>
  <input
    class="input"
    type="checkbox"
    bind:checked={value}
    onclick={(e) => e.stopPropagation()}
    onchange={(e) => {
      const el = e.target as HTMLInputElement;
      setValue?.(el.checked);
    }}
  />
  {#if label}
    <span>{label}</span>
  {:else if children}
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
    box-shadow: 0 1px 1px #00000033;
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
