<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { getBridgeContext } from "./bridge-fns";

  export let value: number;
  let el: HTMLInputElement;
  let config = {
    min: 0.01,
    max: 2,
    step: 0.01,
  };
  const bridge = getBridgeContext();
  const dispatch = createEventDispatcher();
  async function init() {
    try {
      config= {
        ...config,
        ...await bridge(`__PIXI_DEVTOOLS__.speedControlConfig()`)
      };
    } catch {}
  }
  function onInput() {
    if (Number.isNaN(Number(el.value))) {
      return;
    }
    if (value !== Number(el.value)) {
      value = Number(el.value);
      dispatch("change", value);
    }
  }
  function getValueSetterFor(target: number) {
    return () => {
      value = target;
      dispatch("change", value);
    }
  }
</script>
<div class="speed-control">
  {#await init()}
      <p>Waiting...</p>
  {:then}
    <p>Speed: {value}</p>
    {#if value === 0}
      <button class="restore-btn" on:click={getValueSetterFor(1)}>RESTORE</button>
    {:else}
      <button class="stop-btn" on:click={getValueSetterFor(0)}>STOP</button>
    {/if}
    <input
      type="range"
      min={config.min}
      max={config.max}
      step={config.step}
      value={value}
      bind:this={el}
      on:input={onInput}
      class="slider"
    >
  {/await}
</div>


<style lang="scss">
  .speed-control {
    display: flex;

    & > p {
      flex: 0 0 75px;
      color: #c2c2c2;
      margin: 0;
      padding: 0.5em;
    }
    & button {
      flex: 0 0 75px;
      border: 1px solid black;
      border-radius: 4px;
      margin: 03px 5px;
      cursor: pointer;
      color: #c2c2c2;
      &.restore-btn {
        background-color: green;
      }
      &.stop-btn {
        background-color: #c11623;
      }
    }
  }
  .slider {
    flex: 1 1 auto;
    appearance: none;
    -webkit-appearance: none;
    background: #c2c2c2;
    border-radius: 4px;
    padding-right: 6px;
    outline: none;
    opacity: 0.7;
    -webkit-transition: .2s;
    transition: opacity .2s;

    &:hover {
      opacity: 1;
    }

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      border-radius: 2px;
      margin: 0 3px;
      width: 20px;
      height: 20px;
      background: #303030;
      cursor: pointer;
    }

    &::-moz-range-thumb {
      border-radius: 2px;
      margin: 0 3px;
      width: 20px;
      height: 20px;
      background: #303030;
      cursor: pointer;
    }
  }
</style>
