<script lang="ts">
  import TextInput from "../TextInput/TextInput.svelte";
  import Property from "../Property/Property.svelte";
  import RangeInput from "../RangeInput/RangeInput.svelte";
  import ToggleButton from "../ToggleButton/ToggleButton.svelte";
  import LightnessRange from "./ColorPickerBrightnessSlider.svelte";
  import { hexToHsv, hexToRgb, hsvToHex, rgbToHex } from "./color-fns";
  import ColorWheel from "./ColorPickerWheel.svelte";

  export type ColorPickerLocation = "top" | "bottom" | "overlap";
  export type ColorPickerVariant = "tall" | "wide";

  type Props = {
    value: string;
    setValue?: (value: string) => void;
    variant: ColorPickerVariant;
    location: "top" | "bottom" | "overlap";
    onclose: () => void;
  };
  let {
    value = $bindable(),
    setValue,
    variant,
    location,
    onclose,
  }: Props = $props();

  /** Shadow value to detect prop changes */
  let wanted = $state(value);
  let hex = $state(value);
  const initial = hexToHsv(value);
  let h = $state(initial[0]);
  let s = $state(initial[1]);
  let v = $state(initial[2]);
  let [r, g, b, a] = $derived(hexToRgb(value));

  let mode = $state<"rgb" | "hsv">("hsv");

  $effect(() => {
    if (wanted !== value) {
      wanted = value;
      [h, s, v] = hexToHsv(value);
    }
  });

  function syncValue(val: string) {
    value = val;
    wanted = value;
    hex = value;
    [h, s, v] = hexToHsv(value);
    setValue?.(value);
  }

  function setValueHSV(
    hue: number,
    saturation: number,
    brightness: number,
    alpha: number | undefined,
  ) {
    syncValue(hsvToHex(hue, saturation, brightness, alpha));
    h = hue;
    s = saturation;
    v = brightness;
  }

  function setValueRGB(red: number, green: number, blue: number) {
    syncValue(rgbToHex(red, green, blue, a));
  }

  function setAlpha(alpha: number | undefined) {
    if (initial[3] === undefined && alpha === 255) {
      return setAlpha(undefined);
    }
    if (mode === "hsv") {
      setValueHSV(h, s, v, alpha);
    } else {
      syncValue(rgbToHex(r, g, b, alpha));
    }
  }

  function setHex(color: string) {
    const div = document.createElement("div");
    div.style.color = "inherit";
    div.style.color = color;
    if (div.style.color === "inherit") {
      hex = value;
      return;
    }
    document.body.append(div);
    const computedColor = getComputedStyle(div).color;
    div.remove();
    const match =
      /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\)/.exec(
        computedColor,
      );
    if (match === null) {
      return;
    }
    if (computedColor.startsWith("rgba")) {
      syncValue(
        rgbToHex(
          parseInt(match[1]),
          parseInt(match[2]),
          parseInt(match[3]),
          parseFloat(match[4]) * 255,
        ),
      );
    } else {
      syncValue(
        rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3])),
      );
    }
  }

  function handleWheel(e: WheelEvent) {
    const delta = e.deltaY > 0 ? -0.5 : 0.5;
    const brightness = Math.min(100, Math.max(0, v + delta * 10));
    setValueHSV(h, s, brightness, a);
  }

  async function openEyeDropper() {
    const eyeDropper = new (window as any).EyeDropper();
    const result = await eyeDropper.open();
    if (typeof result.sRGBHex === "string") {
      setHex(result.sRGBHex);
    }
  }
</script>

<dialog
  class="color-picker"
  data-location={location}
  closedby="any"
  oncancel={() => onclose()}
  {@attach (el: HTMLDialogElement) => el.showModal()}
>
  <div onwheel={handleWheel} class="tall-or-wide" data-variant={variant}>
    <div class="wheel-and-slider">
      <div class="wheel">
        <ColorWheel
          hue={h}
          saturation={s}
          brightness={v}
          setValue={(hue, saturation) => setValueHSV(hue, saturation, v, a)}
        />
      </div>
      <LightnessRange
        value={v}
        setValue={(brightness) => setValueHSV(h, s, brightness, a)}
      />
    </div>
    <div>
      <div class="rgb-hsv">
        <ToggleButton
          label="RGB"
          rounded="left"
          value={mode === "rgb"}
          onclick={() => {
            mode = "rgb";
          }}
        />
        <ToggleButton
          label="HSV"
          rounded="right"
          value={mode === "hsv"}
          onclick={() => {
            mode = "hsv";
          }}
        />
      </div>
      <div class="sliders">
        {#if mode === "rgb"}
          <RangeInput
            label="Red"
            from={0}
            till={1}
            rounded="top"
            value={r / 255}
            setValue={(red) => setValueRGB(red * 255, g, b)}
          />
          <RangeInput
            label="Green"
            from={0}
            till={1}
            rounded="none"
            value={g / 255}
            setValue={(green) => setValueRGB(r, green * 255, b)}
          />
          <RangeInput
            label="Blue"
            from={0}
            till={1}
            rounded="none"
            value={b / 255}
            setValue={(blue) => setValueRGB(r, g, blue * 255)}
          />
        {:else}
          <RangeInput
            from={0}
            till={1}
            label="Hue"
            rounded="top"
            value={h / 360}
            setValue={(hue) => setValueHSV(hue * 360, s, v, a)}
          />
          <RangeInput
            from={0}
            till={1}
            label="Saturation"
            rounded="none"
            value={s / 100}
            setValue={(saturation) => setValueHSV(h, saturation * 100, v, a)}
          />
          <RangeInput
            from={0}
            till={1}
            label="Brightness"
            rounded="none"
            value={v / 100}
            setValue={(lightness) => setValueHSV(h, s, lightness * 100, a)}
          />
        {/if}
        <RangeInput
          from={0}
          till={1}
          label="Alpha"
          rounded="bottom"
          value={a === undefined ? 1 : a / 255}
          setValue={(alpha) => setAlpha(alpha ? alpha * 255 : alpha)}
        />
      </div>
      <div>
        <Property label="Hex">
          <div class="input-and-eye-dropper">
            <TextInput bind:value={hex} setValue={setHex} />
            {#if "EyeDropper" in window}
              <ToggleButton
                hint="Pick color using a eye dropper"
                icon="pipette"
                onclick={openEyeDropper}
              />
            {/if}
          </div>
        </Property>
      </div>
    </div>
  </div>
</dialog>

<style>
  .color-picker {
    position: absolute;
    inset: auto anchor(right) auto auto;
    position-anchor: --color-input;
    position-try-fallbacks: flip-block;

    box-sizing: border-box;
    max-height: 100vh;
    padding: 8px;
    border: 0;
    border-radius: 2px 3px;

    color: #b3b3b3;

    background: #181818;
    box-shadow: 0 1px 3px #0000004d;

    &::backdrop {
      opacity: 0;
    }

    &[data-location="top"] {
      bottom: anchor(top);
    }

    &[data-location="bottom"] {
      top: anchor(bottom);
      position-try-fallbacks: flip-block;
    }

    &[data-location="overlap"] {
      top: 50%;
      transform: translate(0, -50%);
    }
  }

  .tall-or-wide {
    display: flex;
    gap: 8px;

    &[data-variant="tall"] {
      flex-direction: column;
    }
  }

  .wheel-and-slider {
    display: flex;
    flex-shrink: 0;
    justify-content: space-between;

    width: 184px;
    max-width: 100vw;
  }

  .wheel {
    margin-block: auto;
  }

  .rgb-hsv {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin-bottom: 3px;
  }

  .sliders {
    display: flex;
    flex-direction: column;
    gap: 1px;

    margin-bottom: 8px;

    color: #e5e5e5;
  }

  .input-and-eye-dropper {
    display: flex;
    gap: 6px;
    align-items: center;
  }
</style>
