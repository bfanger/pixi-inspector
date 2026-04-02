<script lang="ts">
  import { hexToRgb } from "./color-fns";
  import ColorPopup from "./ColorPopup.svelte";

  type Props = {
    value: string;
    setValue?: (value: string) => void;
  };
  let { value, setValue }: Props = $props();
  let [r, g, b] = $derived(hexToRgb(value));
  let popupVisible = $state(false);
  let flipped = $state(false);

  function popupLocation(el: HTMLElement) {
    if (!popupVisible) {
      return;
    }
    flipped = el.getBoundingClientRect().top < 320;
  }
</script>

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
    {flipped}
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
