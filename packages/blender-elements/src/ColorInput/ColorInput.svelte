<script lang="ts">
  import { hexToRgb } from "./color-fns";
  import ColorPicker, {
    type ColorPickerLocation,
    type ColorPickerVariant,
  } from "./ColorPicker.svelte";

  type Props = {
    value: string;
    setValue?: (value: string) => void;
  };
  let { value, setValue }: Props = $props();
  let [r, g, b] = $derived(hexToRgb(value));
  let pickerVisible = $state(false);

  let location = $state<ColorPickerLocation>("overlap");
  let variant = $state<ColorPickerVariant>("tall");
  let innerHeight = $state(window.innerHeight);

  function repositionColorPicker(el: HTMLElement) {
    if (!pickerVisible) {
      return;
    }
    const bounds = el.getBoundingClientRect();
    if (bounds.top > 320) {
      location = "top";
      variant = "tall";
    } else if (innerHeight - bounds.bottom > 320) {
      location = "bottom";
      variant = "tall";
    } else if (bounds.top > 180) {
      location = "top";
      variant = "wide";
    } else if (innerHeight - bounds.bottom > 180) {
      location = "bottom";
      variant = "wide";
    } else if (innerHeight > 400) {
      location = "overlap";
      variant = "tall";
    } else {
      location = "overlap";
      variant = "wide";
    }
  }
</script>

<svelte:window bind:innerHeight />

<button
  aria-label={value}
  class="color-input"
  style:anchor-name={pickerVisible ? "--color-input" : undefined}
  {@attach repositionColorPicker}
  onclick={() => {
    pickerVisible = !pickerVisible;
  }}
>
  <div class="half" style:background-color="rgb({r} {g} {b})"></div>
  <div class="half" style:background-color={value}></div>
</button>
{#if pickerVisible}
  <ColorPicker
    bind:value
    {setValue}
    {location}
    {variant}
    onclose={() => {
      pickerVisible = false;
    }}
  />
{/if}

<style>
  .color-input {
    overflow: hidden;
    display: flex;

    width: 100%;
    height: 18px;
    padding: 0;
    border: 0;
    border-bottom: 1px solid #3c3c3e;
    border-radius: 2px / 3px;

    appearance: none;
    background: repeating-conic-gradient(#a0a0a0 0 25%, #646464 0 50%) 50% / 9px
      9px;
    box-shadow: 0 1px 3px #0000004d;
  }

  .half {
    width: 50%;
    height: 100%;
  }
</style>
