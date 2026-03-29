<script lang="ts">
  type Props = {
    value: number;
    setValue?: (value: number) => void;
  };

  let active = $state(false);
  let { value = $bindable(), setValue }: Props = $props();
</script>

<svelte:window
  onmouseup={() => {
    active = false;
  }}
/>

<input
  class="brightness-slider"
  class:active
  type="range"
  style:color="hsl(0 0 {value})"
  bind:value
  min="0"
  max="100"
  step="1"
  onmousedown={() => {
    active = true;
  }}
  oninput={(e) => {
    value = Number(e.currentTarget.value);
    setValue?.(value);
  }}
/>

<style>
  .brightness-slider {
    height: 160px;
    margin: 0;
    padding: 0;

    writing-mode: sideways-lr;

    appearance: none;
    background: transparent;
    outline: none;

    &::-webkit-slider-thumb {
      width: 13px;
      height: 8px;
      margin-block-start: -1px;
      border: 1px solid white;

      appearance: none;
      background: currentcolor;
      outline: 1px solid black;
    }

    &::-moz-range-thumb {
      width: 13px;
      height: 8px;
      margin-block-start: -1px;
      border: 1px solid white;
      border-radius: 0;

      background: currentcolor;
      outline: 1px solid black;
    }

    &::-webkit-slider-runnable-track {
      width: 13px;
      border: 1px solid black;
      background: linear-gradient(to top, #000, #fff);
    }

    &::-moz-range-track {
      width: 13px;
      border: 1px solid black;
      background: linear-gradient(to top, #000, #fff);
    }

    &:focus-visible::-webkit-slider-thumb,
    &.active::-webkit-slider-thumb {
      width: 15px;
      margin-block-start: -2px;
    }

    &:focus-visible::-moz-range-thumb,
    &.active::-moz-range-thumb {
      width: 15px;
      margin-block-start: -2px;
    }
  }
</style>
