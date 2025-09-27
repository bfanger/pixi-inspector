<script lang="ts">
  import Base from "blender-elements/src/Base.svelte";
  import Instructions from "./Instructions.svelte";
  import type { BridgeFn } from "./types";
  import { setBridgeContext } from "./bridge-fns";
  import { evalConnect } from "ui-protocol/src/evalBridge";
  import Warning from "./Warning.svelte";
  import Display from "ui-protocol/src/svelte/Display.svelte";
  import { onDestroy } from "svelte";
  import components from "ui-protocol/src/svelte/components";
  import { fade } from "svelte/transition";
  import PixiInject from "./PixiInject.svelte";
  // @ts-ignore
  import miniUI from "../build/ui-mini.txt?raw";
  import SceneGraphLegacy from "./SceneGraphLegacy.svelte";
  import PropertiesLegacy from "./PropertiesLegacy.svelte";

  Object.assign(components, {
    Instructions,
    PixiInject,
    PixiSceneGraph: SceneGraphLegacy,
    PixiProperties: PropertiesLegacy,
  });

  type Props = {
    bridge: BridgeFn;
  };
  let { bridge }: Props = $props();

  setBridgeContext(bridge);
  let disconnected = $state(false);

  const abortController = new AbortController();
  onDestroy(() => {
    abortController.abort("PixiPanel unmounted");
  });
  const signal = abortController.signal;

  function reconnect() {
    if (signal.aborted) {
      throw new Error(`reconnected aborted: ${signal.reason}`);
    }
    const promise = Promise.all([
      bridge(miniUI),
      evalConnect("pixi", bridge, {
        signal,
      }),
    ]);
    promise.then(() => {
      disconnected = false;
    });
    const timeout = setTimeout(() => {
      requestAnimationFrame(reconnect);
    }, 500);
    promise.finally(() => clearTimeout(timeout));
    return promise;
  }

  let connectionPromise = $state(reconnect());
</script>

<Base>
  {#if disconnected}
    <div in:fade={{ delay: 100, duration: 100 }}>
      <Warning message="Disconnected. Reconnecting..." />
    </div>
  {:else}
    {#await connectionPromise}
      <div in:fade={{ delay: 1000, duration: 100 }}>
        <Warning message="Connecting taking longer than expected..." />
      </div>
    {:then [, connection]}
      <Display
        {connection}
        ondisconnect={() => {
          disconnected = true;
          reconnect();
        }}
      />
    {:catch err}
      <Warning message={err.message} />
    {/await}
  {/if}
</Base>

<style>
  :global(html) {
    height: 100%;
  }

  :global(body) {
    height: 100%;
    margin: 0;
  }
</style>
