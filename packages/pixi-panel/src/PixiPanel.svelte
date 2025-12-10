<script lang="ts">
  import Base from "blender-elements/src/Base.svelte";
  import Instructions from "./Instructions.svelte";
  import type { BridgeFn } from "./types";
  import { setBridgeContext } from "./bridge-fns";
  import { evalConnect } from "ui-protocol/src/evalBridge";
  import Warning from "blender-elements/src/Warning/Warning.svelte";
  import Display from "ui-protocol/src/svelte/Display.svelte";
  import { onDestroy } from "svelte";
  import components from "ui-protocol/src/svelte/components";
  import { fade } from "svelte/transition";
  import PixiInject from "./PixiInject.svelte";
  // @ts-ignore
  import miniUI from "../build/ui-mini.txt?raw";
  import SceneGraphLegacy from "./SceneGraphLegacy.svelte";
  import PropertiesLegacy from "./PropertiesLegacy.svelte";
  import type { Connection } from "ui-protocol/src/types";

  Object.assign(components, {
    PixiInstructions: Instructions,
    PixiInject,
    PixiSceneGraph: SceneGraphLegacy,
    PixiProperties: PropertiesLegacy,
  });

  type Props = {
    bridge: BridgeFn;
  };
  let { bridge }: Props = $props();

  setBridgeContext((...args) => bridge(...args));
  let errorMessage = $state("");
  let connectionPromise = $state<Promise<Connection>>();

  const abortController = new AbortController();
  onDestroy(() => {
    abortController.abort("PixiPanel unmounted");
  });
  const signal = abortController.signal;

  // Wait 1s before showing the error, but start reconnecting after 250ms
  let ignoreErrors = false;
  function onerror(err: unknown) {
    if (!ignoreErrors) {
      ignoreErrors = true;
      setTimeout(() => {
        setTimeout(() => {
          if (ignoreErrors) {
            if (err instanceof Error) {
              errorMessage = err.message;
            }
            errorMessage ||= "Connection lost. Reconnecting...";
            ignoreErrors = false;
          }
        }, 750);
        reconnect();
      }, 250);
    }
  }

  function reconnect() {
    if (signal.aborted) {
      throw new Error(`reconnected aborted: ${signal.reason}`);
    }
    const promise = Promise.all([
      Promise.try(() => bridge(miniUI)),
      evalConnect("pixi", bridge, { signal }),
    ]).then(([, connection]) => {
      errorMessage = "";
      ignoreErrors = false;
      return connection;
    });

    connectionPromise = promise;

    const timeout = setTimeout(() => {
      requestAnimationFrame(() => {
        errorMessage = "Connection timed out, retrying...";
        if (promise === connectionPromise) {
          reconnect();
        }
      });
    }, 500);
    promise.finally(() => {
      clearTimeout(timeout);
    });
    promise.catch((err) => {
      errorMessage =
        err instanceof Error ? err.message : "Connection failed, retrying...";
      setTimeout(() => {
        requestAnimationFrame(() => {
          if (promise === connectionPromise) {
            reconnect();
          }
        });
      }, 500);
    });
  }

  reconnect();
</script>

<Base>
  {#if errorMessage}
    <div in:fade={{ delay: 100, duration: 100 }}>
      <Warning message={errorMessage} />
    </div>
  {:else if connectionPromise}
    {#await connectionPromise}
      <div in:fade={{ delay: 1000, duration: 100 }}>
        <Warning message="Connecting taking longer than expected..." />
      </div>
    {:then connection}
      <Display {connection} {onerror} />
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
