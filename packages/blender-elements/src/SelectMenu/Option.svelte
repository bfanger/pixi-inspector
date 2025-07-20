<script lang="ts">
  type Props = {
    value: string;
    icon?: string | undefined;
    label?: string | undefined;
    onclick: () => void;
  };

  let { value, icon = undefined, label = undefined, onclick }: Props = $props();
</script>

<button class="option" {onclick}>
  {#if icon}
    <span class="icon" style="background-image: var(--icon-{icon})"></span>
  {/if}
  <span>{label ?? value}</span>
</button>

<style>
  .option {
    cursor: pointer;
    user-select: none;

    display: flex;
    gap: 4px;
    align-items: center;

    min-height: 18px;
    padding: 0 6px;
    border: 0;
    border-radius: 3px;

    font: inherit;
    color: #ddd;
    text-align: left;

    background: transparent;

    &:hover {
      color: #fff;
      background: #4772b3;
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
