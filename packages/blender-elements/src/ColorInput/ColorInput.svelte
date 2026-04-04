<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { hexToRgb } from "./color-fns";
  import ColorPopup from "./ColorPopup.svelte";

  type Props = {
    value: string;
    setValue?: (value: string) => void;
  };
  let { value, setValue }: Props = $props();
  let [r, g, b] = $derived(hexToRgb(value));
  let popupVisible = $state(false);
  type PopupLocation = ComponentProps<typeof ColorPopup>["location"];
  type PopupVariant = ComponentProps<typeof ColorPopup>["variant"];
  let location = $state<PopupLocation>("overlap");
  let variant = $state<PopupVariant>("tall");
  let innerHeight = $state(window.innerHeight);

  function popupLocation(el: HTMLElement) {
    if (!popupVisible) {
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
  class="color-field"
  style:anchor-name={popupVisible ? "--color-field" : undefined}
  onclick={() => {
    popupVisible = !popupVisible;
  }}
  {@attach popupLocation}
>
  <div class="bg" style:background-color="rgb({r} {g} {b})"></div>
  <div class="bg" style:background-color={value}></div>
</button>
{#if popupVisible}
  <ColorPopup
    bind:value
    {setValue}
    {location}
    {variant}
    onclose={() => {
      popupVisible = false;
    }}
  />
{/if}

<style>
  .color-field {
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

  .bg {
    width: 50%;
    height: 100%;
  }
</style>
