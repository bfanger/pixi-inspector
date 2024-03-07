import { getContext, setContext } from "svelte";
import { readable, Readable, writable } from "svelte/store";
import type { BridgeFn } from "./types";

export function setBridgeContext(bridge: BridgeFn) {
  setContext("bridge", bridge);
}

export function getBridgeContext(): BridgeFn {
  const ctx = getContext<BridgeFn>("bridge");
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!ctx) {
    throw new Error("Bridge context not found");
  }
  return ctx;
}

type AsyncResult<T> = { data: T | undefined; error: Error | undefined };
type Pollable<T> = Readable<AsyncResult<T>> & {
  polling: Readable<boolean>;
  sync: () => void;
};

export function poll<T>(
  bridge: BridgeFn,
  code: string,
  interval: number,
): Pollable<T> {
  const state: AsyncResult<T> = { data: undefined, error: undefined };
  let updater: (state: AsyncResult<T>) => void;
  const polling = writable(false);
  async function sync() {
    polling.set(true);
    try {
      // @todo Detect if data was changed?
      state.data = await bridge<T>(code);
      state.error = undefined;
    } catch (err: any) {
      state.error = err;
      state.data = undefined;
    }
    polling.set(false);
    updater(state);
  }
  const store = readable<AsyncResult<T>>(state, (set) => {
    updater = set;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    sync();
    const timer = window.setInterval(sync, interval);
    return () => clearInterval(timer);
  });
  return {
    subscribe: store.subscribe,
    polling: { subscribe: polling.subscribe },
    sync,
  };
}
