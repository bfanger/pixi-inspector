<script lang="ts">
  import TextField from "../TextField/TextField.svelte";
  import Property from "../Property/Property.svelte";
  import RangeField from "../RangeField/RangeField.svelte";
  import Toggle from "../Toggle/Toggle.svelte";
  import LightnessRange from "./LightnessRange.svelte";
  import { hexToHsl, hexToRgb, hslToHex, rgbToHex } from "./color-fns";

  type Props = {
    value: string;
    setValue?: (value: string) => void;
  };

  let { value = $bindable(), setValue }: Props = $props();

  /** Shadow value to detect prop changes */
  let wanted = $state(value);
  let hex = $state(value);
  const initial = hexToHsl(value);
  let h = $state(initial[0]);
  let s = $state(initial[1]);
  let l = $state(initial[2]);
  let [r, g, b, a] = $derived(hexToRgb(value));

  let mode = $state<"rgb" | "hsl">("hsl");

  $effect(() => {
    if (wanted !== value) {
      wanted = value;
      [h, s, l] = hexToHsl(value);
    }
  });

  function syncValue(val: string) {
    value = val;
    wanted = value;
    hex = value;
    [h, s, l] = hexToHsl(value);
    setValue?.(value);
  }

  function setValueHSL(
    hue: number,
    saturation: number,
    lightness: number,
    alpha: number | undefined,
  ) {
    syncValue(hslToHex(hue, saturation, lightness, alpha));
    h = hue;
    s = saturation;
    l = lightness;
  }

  function setValueRGB(red: number, green: number, blue: number) {
    syncValue(rgbToHex(red, green, blue, a));
  }

  function setAlpha(alpha: number | undefined) {
    if (initial[3] === undefined && alpha === 255) {
      return setAlpha(undefined);
    }
    if (mode === "hsl") {
      setValueHSL(h, s, l, alpha);
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
</script>

<div class="color-picker">
  <div class="visual">
    <div class="hue"></div>
    <LightnessRange
      value={l}
      setValue={(value) => setValueHSL(h, s, value, a)}
    />
  </div>
  <div>
    <div class="rgb-hsl">
      <Toggle
        label="RGB"
        rounded="left"
        value={mode === "rgb"}
        onclick={() => {
          mode = "rgb";
        }}
      /><Toggle
        label="HSL"
        rounded="right"
        value={mode === "hsl"}
        onclick={() => {
          mode = "hsl";
        }}
      />
    </div>
    <div class="sliders">
      {#if mode === "rgb"}
        <RangeField
          label="Red"
          from={0}
          till={1}
          rounded="top"
          value={r / 255}
          setValue={(red) => setValueRGB(red * 255, g, b)}
        />
        <RangeField
          label="Green"
          from={0}
          till={1}
          rounded="none"
          value={g / 255}
          setValue={(green) => setValueRGB(r, green * 255, b)}
        />
        <RangeField
          label="Blue"
          from={0}
          till={1}
          rounded="none"
          value={b / 255}
          setValue={(blue) => setValueRGB(r, g, blue * 255)}
        />
      {:else}
        <RangeField
          from={0}
          till={360}
          label="Hue"
          rounded="top"
          value={h}
          setValue={(hue) => setValueHSL(hue, s, l, a)}
        />
        <RangeField
          from={0}
          till={100}
          label="Saturation"
          rounded="none"
          value={s}
          setValue={(saturation) => setValueHSL(h, saturation, l, a)}
        />
        <RangeField
          from={0}
          till={100}
          label="Lightness"
          rounded="none"
          value={l}
          setValue={(lightness) => setValueHSL(h, s, lightness, a)}
        />
      {/if}
      <RangeField
        from={0}
        till={1}
        label="Alpha"
        rounded="bottom"
        value={a ? a / 255 : 1}
        setValue={(alpha) => setAlpha(alpha ? alpha * 255 : alpha)}
      />
    </div>
  </div>
  <div>
    <Property label="Hex">
      <TextField bind:value={hex} setValue={setHex} />
    </Property>
  </div>
</div>
<div style="width: 40px; height: 40px; background: {value}"></div>

<style>
  .color-picker {
    width: 400px;
    max-width: 100vw;
    padding: 16px;
    background: #181818;
  }

  .visual {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .rgb-hsl {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    margin-bottom: 8px;
  }

  .sliders {
    display: flex;
    flex-direction: column;
    gap: 1px;
    margin-bottom: 8px;
  }
</style>
