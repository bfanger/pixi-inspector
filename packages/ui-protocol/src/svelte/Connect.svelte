<script lang="ts">
  import type { BridgeFn, Connection } from "../types";
  import { evalConnect } from "../evalBridge";
  import Display from "./Display.svelte";
  import { onDestroy, untrack, type Snippet } from "svelte";

  type Props = {
    ui: string;
    inject: () => Promise<string>;
    bridge: BridgeFn;
    children?: Snippet;
    onlog?: (line: string) => void;
    onerror?: (err: Error) => void;
    onrestore?: () => void;
  };
  let { ui, inject, bridge, children, onerror, onrestore, onlog }: Props =
    $props();

  let connection = $state<Connection>();
  let connectionPromise: Promise<void> | undefined;
  let code = "";
  let skipError = false;

  const abortController = new AbortController();
  const signal = abortController.signal;

  onDestroy(() => {
    abortController.abort("unmounted");
  });

  function log(line: string) {
    untrack(() => onlog?.(line));
  }

  async function prepare() {
    log("Inspecting page...");
    const injected = await bridge(
      `typeof window?.__UI_PROTOCOL__?.[${JSON.stringify(ui)}]`,
    );
    if (injected === "undefined") {
      log("Preparing connection...");
      await bridge(code);
    }
    log("Connecting...");
  }

  function reconnect() {
    if (signal.aborted) {
      throw new Error(`aborted reconnect: ${signal.reason}`);
    }
    const promise = prepare()
      .then(() => evalConnect(ui, bridge, { signal }))
      .then((result) => {
        if (signal.aborted) {
          return;
        }
        log("Connection successful");
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
      log(`Connection failed: ${err.message}`);
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
    inject()
      .then((result) => {
        code = result;
        reconnect();
      })
      .catch((err) => {
        log(`Initialization failed: ${err.message}`);
        throw err;
      });
  });

  function handleError(err: Error) {
    connection = undefined;
    onerror?.(err);
    log(`Unstable connection: ${err.message}`);
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
