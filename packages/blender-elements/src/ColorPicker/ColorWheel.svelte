<script lang="ts" module>
  async function generateColorWheel() {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 320;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return "";
    }

    const imageData = ctx.createImageData(320, 320);
    const data = imageData.data;

    for (let y = 0; y < 320; y++) {
      for (let x = 0; x < 320; x++) {
        const dx = x - 160;
        const dy = y - 160;

        let h = Math.atan2(dy, dx) * (180 / Math.PI) - 90;
        let s = Math.min(100, Math.sqrt(dx * dx + dy * dy) / 1.6);
        const v = 100;

        if (h < 0) {
          h += 360;
        }
        const [r, g, b] = hsvToRgb(h, s, v);

        const index = (y * 320 + x) * 4;
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          return reject(
            new Error("Failed to create an image from the colorwheel canvas"),
          );
        }
        resolve(blob);
      });
    });
    return URL.createObjectURL(blob);
  }

  let colorWheelPromise = generateColorWheel();
</script>

<script lang="ts">
  import { hsvToHex, hsvToRgb } from "./color-fns";

  type Props = {
    hue: number;
    saturation: number;
    brightness: number;
    setValue?: (hue: number, saturation: number) => void;
  };

  let { hue, saturation, brightness, setValue }: Props = $props();

  let el = $state<HTMLImageElement>();
  let src = $state("");
  let selecting = $state(false);

  let markerX = $derived(
    80 +
      (saturation / 100) * 80 * Math.cos((hue * Math.PI) / 180 + Math.PI / 2),
  );
  let markerY = $derived(
    80 +
      (saturation / 100) * 80 * Math.sin((hue * Math.PI) / 180 + Math.PI / 2),
  );

  colorWheelPromise.then((url) => {
    src = url;
  });

  function handlePointerDown(e: PointerEvent) {
    selecting = true;
    syncValue(e);
  }

  function handlePointerMove(e: PointerEvent) {
    if (selecting) {
      syncValue(e);
    }
  }

  function handlePointerUp() {
    selecting = false;
  }

  function syncValue(e: PointerEvent) {
    if (!el) {
      return;
    }
    const bounds = el.getBoundingClientRect();
    const x = e.clientX - bounds.left - 80;
    const y = e.clientY - bounds.top - 80;

    let h = Math.atan2(y, x) * (180 / Math.PI) - 90;
    if (h < 0) {
      h += 360;
    }
    const s = (Math.min(80, Math.sqrt(x * x + y * y)) / 80) * 100;

    setValue?.(h, s);
  }
</script>

<svelte:window
  onpointerup={handlePointerUp}
  onpointermove={handlePointerMove}
/>
<div class="color-wheel">
  <img
    bind:this={el}
    {src}
    draggable="false"
    alt="Color wheel"
    style:filter="brightness({brightness / 100})"
    onpointerdown={handlePointerDown}
  />
  <div
    class="marker"
    class:selecting
    style:border-color="hsl(0 0 {100 - brightness})"
    style:background-color={hsvToHex(hue, saturation, brightness)}
    style:top="{markerY}px"
    style:left="{markerX}px"
  ></div>
</div>

<style>
  .color-wheel {
    position: relative;
  }

  img {
    width: 160px;
    height: 160px;
    border-radius: 50%;

    &:active {
      cursor: none;
    }
  }

  .marker {
    pointer-events: none;

    position: absolute;
    transform: translate(-50%, -50%);

    width: 10px;
    height: 10px;
    border: 1px solid transparent;
    border-radius: 50%;

    box-shadow: 0 0 2px rgb(0 0 0 / 50%);

    &.selecting {
      width: 20px;
      height: 20px;
    }
  }
</style>
