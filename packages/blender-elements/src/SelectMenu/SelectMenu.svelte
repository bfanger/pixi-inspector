<script lang="ts">
  import { tick } from "svelte";
  import Option from "./Option.svelte";

  type OptionType = string | { value: string; label?: string; icon?: string };

  type Props = {
    value: string;
    setValue?: (value: string) => void;
    options: OptionType[];
    legend?: string;
  };

  let { value = $bindable(), options, legend = "", setValue }: Props = $props();

  let current = $derived(
    options.find((option) => {
      if (typeof option === "string") {
        return option === value;
      }
      return option.value === value;
    }),
  );

  let el: HTMLDivElement | undefined = $state();
  let expanded: undefined | { x: "LEFT" | "RIGHT"; y: "UP" | "DOWN" } =
    $state();
  let timer: number | undefined;

  function select(next: OptionType) {
    value = typeof next === "string" ? next : next.value;
    setValue?.(value);
    collapse();
  }

  async function expand() {
    expanded = {
      x: "LEFT",
      y: "DOWN",
    };
    await tick();

    if (!expanded) {
      return;
    }
    if (!el) {
      return;
    }
    const bounds = el.getBoundingClientRect();
    const { x, y, height } = bounds;
    const { innerHeight } = window;
    if (x < 0) {
      expanded.x = "RIGHT";
    }
    if (y + height > innerHeight) {
      expanded.y = "UP";
    }
  }

  function collapse() {
    expanded = undefined;
  }

  function onLeave() {
    timer = window.setTimeout(collapse, 0);
  }
  function onEnter() {
    clearTimeout(timer);
    timer = undefined;
  }
</script>

<div
  class="search-field"
  class:expanded
  class:up={expanded?.y === "UP"}
  class:right={expanded?.x === "RIGHT"}
  class:down={expanded?.y === "DOWN"}
  class:left={expanded?.x === "LEFT"}
>
  <button class="value" onclick={expand}>
    {#if typeof current === "string"}
      <span>{current}</span>
    {:else if current}
      {#if current.icon}
        <span class="icon" style="background-image: var(--icon-{current.icon})"
        ></span>
      {/if}
      <span>{current.label ?? current.value}</span>
    {/if}
  </button>
  {#if expanded}
    <div class="popout" bind:this={el}>
      <button
        class="detector"
        onmouseleave={onLeave}
        onclick={collapse}
        aria-label="close"
      ></button>
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="options" onmouseenter={onEnter}>
        {#each options as option (option)}
          {#if typeof option === "string"}
            <Option value={option} onclick={() => select(option)} />
          {:else}
            <Option
              value={option.value}
              icon={option.icon}
              label={option.label}
              onclick={() => select(option)}
            />
          {/if}
        {/each}
      </div>
      {#if legend}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="legend" onmouseenter={onEnter}>{legend}</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .search-field {
    position: relative;
  }

  .value {
    cursor: pointer;

    display: flex;
    gap: 4px;
    align-items: center;

    box-sizing: border-box;
    width: 100%;
    min-height: 18px;
    padding: 2px 20px 1px 4px;
    border: none;
    border: 1px solid #3d3d3d;
    border-radius: 4px;

    font: inherit;
    color: #fdfdfd;
    text-align: left;

    appearance: none;
    background: #282828;
    background-color: transparent;
    outline: none;
    box-shadow: 0 1px 3px #0000004d;

    &::after {
      content: "";

      position: absolute;
      top: 1px;
      right: 3px;

      width: 16px;
      height: 16px;

      opacity: 0.5;
      background: var(--icon-chevron-down) center center no-repeat;
    }

    &:hover {
      border-color: #414141;
      background: #232323;
    }
  }

  .expanded .value {
    color: #fff;
    background: #446290;
  }

  .expanded.up .value {
    border-top-color: #446290;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  .expanded.down .value {
    border-bottom-color: #446290;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
  }

  .icon {
    display: inline-block;

    width: 16px;
    height: 16px;

    background: no-repeat center center;
    background-size: contain;
  }

  .popout {
    position: absolute;
    z-index: 1;

    box-sizing: border-box;
    min-width: 100%;
    border: 1px solid #242424;
    border-radius: 4px;

    background: #181818;
  }

  .up .popout {
    bottom: 100%;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  .right .popout {
    left: 0;
  }

  .down .popout {
    top: 100%;
    border-bottom-right-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  .left .popout {
    right: 0;
  }

  .detector {
    position: absolute;
    inset: -32px;
    border: none;
    background-color: transparent;
  }

  .options {
    position: relative;

    display: flex;
    flex-direction: column;
    gap: 4px;

    padding: 2px;
  }

  .legend {
    position: relative;
    padding: 5px 8px 4px;
    color: #989898;
  }

  .down .legend {
    border-top: 1px solid #2f2f2f;
  }
</style>
