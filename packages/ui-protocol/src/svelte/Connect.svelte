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

  const destroyController = new AbortController();
  const destroySignal = destroyController.signal;

  onDestroy(() => {
    destroyController.abort("unmounted");
  });

  function log(line: string) {
    untrack(() => onlog?.(line));
  }

  function sleep(duration: number, signal: AbortSignal): Promise<void> {
    const { promise, resolve, reject } = Promise.withResolvers<void>();
    let timer: number | undefined;
    function cancel() {
      clearTimeout(timer);
      requestAnimationFrame(() =>
        reject(new Error(signal.reason || "sleep() was aborted")),
      );
    }
    if (signal.aborted) {
      cancel();
    } else {
      timer = window.setTimeout(() => {
        signal.removeEventListener("abort", cancel);
        requestAnimationFrame(() => resolve());
      }, duration);
      signal.addEventListener("abort", cancel, { once: true });
    }
    return promise;
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

  async function waitForIdle(signal: AbortSignal) {
    while (!signal.aborted) {
      const result = await Promise.race<2 | void>([
        bridge("1 + 1"),
        sleep(100, signal),
      ]);
      if (result === 2) {
        return;
      }
      log("Waiting for page to respond");
      await sleep(500, signal);
    }
  }

  function reconnect() {
    if (destroySignal.aborted) {
      throw new Error(`aborted reconnect: ${destroySignal.reason}`);
    }
    const connectController = new AbortController();
    const signal = connectController.signal;
    destroySignal.addEventListener(
      "abort",
      () => connectController.abort(destroySignal.reason),
      { once: true },
    );

    const promise = waitForIdle(signal)
      .then(() => prepare())
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
      connectController.abort("Connection timed out");
    }, 5_000);
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
