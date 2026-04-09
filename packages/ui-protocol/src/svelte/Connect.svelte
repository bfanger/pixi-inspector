<script lang="ts">
  import type { BridgeFn, Connection } from "../types";
  import { evalConnect } from "../evalBridge";
  import Display from "./Display.svelte";
  import { onDestroy, type Snippet } from "svelte";

  type Props = {
    ui: string;
    inject: () => Promise<string>;
    bridge: BridgeFn;
    children?: Snippet;
    onerror?: (err: Error) => void;
    onrestore?: () => void;
  };
  let { ui, inject, bridge, children, onerror, onrestore }: Props = $props();

  let connection = $state<Connection>();
  let connectionPromise: Promise<void> | undefined;
  let code = "";
  let skipError = false;

  const abortController = new AbortController();
  const signal = abortController.signal;

  onDestroy(() => {
    abortController.abort("unmounted");
  });

  async function prepare() {
    const injected = await bridge(
      `typeof window?.__UI_PROTOCOL__?.[${JSON.stringify(ui)}]`,
    );
    if (injected === "undefined") {
      await bridge(code);
    }
  }

  function reconnect() {
    if (signal.aborted) {
      throw new Error(`reconnected aborted: ${signal.reason}`);
    }
    const promise = prepare()
      .then(() => evalConnect(ui, bridge, { signal }))
      .then((result) => {
        if (signal.aborted) {
          return;
        }
        connection = result;
        skipError = false;
        onrestore?.();
      });
    connectionPromise = promise;

    const timeout = setTimeout(() => {
      requestAnimationFrame(() => {
        if (promise === connectionPromise) {
          reconnect();
        }
      });
    }, 750);
    promise.finally(() => {
      clearTimeout(timeout);
    });
    promise.catch((err) => {
      console.warn(new Error("Connection failed, retrying...", { cause: err }));
      setTimeout(() => {
        requestAnimationFrame(() => {
          if (promise === connectionPromise) {
            if (!skipError) {
              onerror?.(err);
              skipError = true;
            }
            reconnect();
          }
        });
      }, 500);
    });
  }
  $effect(() => {
    inject().then((result) => {
      code = result;
      reconnect();
    });
  });

  function handleError(err: Error) {
    connection = undefined;
    onerror?.(err);
    skipError = true;
    setTimeout(() => {
      reconnect();
    }, 250);
  }
</script>

{#if connection}
  <Display {connection} onerror={handleError} />
{:else}
  {@render children?.()}
{/if}
