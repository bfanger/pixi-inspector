<script lang="ts">
  import Base from "blender-elements/src/Base.svelte";
  import Instructions from "./Instructions.svelte";
  import type { BridgeFn } from "./types";
  import { setBridgeContext } from "./bridge-fns";
  import { evalConnect } from "ui-protocol/src/evalBridge";
  import type { Connection } from "ui-protocol/src/types";
  import Warning from "./Warning.svelte";
  import Display from "ui-protocol/src/svelte/Display.svelte";
  import { onDestroy } from "svelte";
  import components from "ui-protocol/src/svelte/components";
  import { fade } from "svelte/transition";
  import PixiInject from "./PixiInject.svelte";
  // @ts-ignore
  import miniUI from "../build/ui-mini.txt?raw";

  Object.assign(components, {
    Instructions,
    PixiInject,
  });

  type Props = {
    bridge: BridgeFn;
  };
  let { bridge }: Props = $props();

  setBridgeContext(bridge);

  const abortController = new AbortController();
  onDestroy(() => {
    abortController.abort("PixiPanel unmounted");
  });
  const signal = abortController.signal;

  function reconnect() {
    if (signal.aborted) {
      throw new Error(`reconnected aborted: ${signal.reason}`);
    }
    const promise = evalConnect("pixi", bridge, {
      signal,
    });
    void bridge(miniUI);
    return promise;
  }

  let connectionPromise: Promise<Connection> = $state(reconnect());

  void bridge(miniUI);
</script>

<Base>
  {#await connectionPromise}
    <div in:fade={{ delay: 1000, duration: 100 }}>
      <Warning message="Connecting taking longer than expected..." />
    </div>
  {:then connection}
    <Display
      {connection}
      ondisconnect={() => {
        connectionPromise = Promise.reject(new Error("Disconnected"));
        setTimeout(() => (connectionPromise = reconnect()), 500);
      }}
    />
  {:catch err}
    <Warning message="Failed to connect: {err.message}" />
  {/await}
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
