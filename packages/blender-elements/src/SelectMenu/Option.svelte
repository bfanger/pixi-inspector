<script lang="ts">
  export let value: string;
  export let icon: string | undefined = undefined;
  export let label: string | undefined = undefined;
</script>

<button class="option" on:click>
  {#if icon}
    <span class="icon" style="background-image: var(--icon-{icon})" />
  {/if}
  <span>{label ?? value}</span>
</button>

<style>
  .option {
    font:
      12px system-ui,
      sans-serif;
    color: #dddddd;
    padding: 0 6px 0 6px;
    user-select: none;
    background: transparent;
    border: 0;
    border-radius: 3px;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 18px;
    cursor: pointer;

    &:hover {
      background: #4772b3;
      color: #ffffff;
    }
  }
  .icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    background: no-repeat center center;
    background-size: contain;
  }
</style>
