<script lang="ts">
  import { createEventDispatcher, tick } from "svelte";
  import Option from "./Option.svelte";

  type OptionType = string | { value: string; label?: string; icon?: string };

  export let value: string;
  export let options: OptionType[];
  export let legend = "";

  $: current = options.find((option) => {
    if (typeof option === "string") {
      return option === value;
    }
    return option.value === value;
  });

  const dispatch = createEventDispatcher();

  let el: HTMLDivElement;
  let expanded: undefined | { x: "LEFT" | "RIGHT"; y: "UP" | "DOWN" };
  let timer: number | undefined;

  function select(next: OptionType) {
    value = typeof next === "string" ? next : next.value;
    dispatch("change", value);
    collapse();
  }

  async function expand() {
    expanded = {
      x: "LEFT",
      y: "DOWN",
    };
    await tick();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!expanded) {
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
  <button class="value" on:click={expand}>
    {#if typeof current === "string"}
      <span>{current}</span>
    {:else if current}
      {#if current.icon}
        <span
          class="icon"
          style="background-image: var(--icon-{current.icon})"
        />
      {/if}
      <span>{current.label ?? current.value}</span>
    {/if}
  </button>
  {#if expanded}
    <div class="popout" bind:this={el}>
      <button class="detector" on:mouseleave={onLeave} on:click={collapse} />
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="options" on:mouseenter={onEnter}>
        {#each options as option}
          {#if typeof option === "string"}
            <Option value={option} on:click={() => select(option)} />
          {:else}
            <Option
              value={option.value}
              icon={option.icon}
              label={option.label}
              on:click={() => select(option)}
            />
          {/if}
        {/each}
      </div>
      {#if legend}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="legend" on:mouseenter={onEnter}>{legend}</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .search-field {
    position: relative;
  }
  .value {
    font:
      12px system-ui,
      sans-serif;
    appearance: none;
    background-color: transparent;
    border: none;
    box-sizing: border-box;
    width: 100%;
    color: #fdfdfd;
    outline: none;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 20px 0 4px;
    background: #1d1d1d;
    border: 1px solid #3d3d3d;
    box-shadow: 0 1px 3px rgba(black, 0.3);
    border-radius: 4px;
    text-align: left;
    min-height: 18px;
    cursor: pointer;

    &:hover {
      background: #232323;
      border-color: #414141;
    }

    &:after {
      content: "";
      position: absolute;
      top: 1px;
      right: 3px;
      width: 16px;
      height: 16px;
      background: var(--icon-chevron-down) center center no-repeat;
      opacity: 0.5;
    }
  }
  .expanded .value {
    background: #446290;
    color: #ffffff;
  }
  .expanded.up .value {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-top-color: #446290;
  }
  .expanded.down .value {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom-color: #446290;
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
    background: #181818;
    border: 1px solid #242424;
    border-radius: 4px;
  }
  .up .popout {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    bottom: 100%;
  }
  .right .popout {
    left: 0;
  }
  .down .popout {
    top: 100%;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
  .left .popout {
    right: 0;
  }
  .detector {
    position: absolute;
    top: -32px;
    right: -32px;
    bottom: -32px;
    left: -32px;
    background-color: transparent;
    border: none;
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
    color: #989898;
    padding: 5px 8px 4px 8px;
  }
  .down .legend {
    border-top: 1px solid #2f2f2f;
  }
</style>
