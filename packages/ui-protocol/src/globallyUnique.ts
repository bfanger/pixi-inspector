const aborts: Record<string, () => void> = ((window as any)[
  "__UI_PROTOCOL_ABORTS__"
] = (window as any)["__UI_PROTOCOL_ABORTS__"] ?? {});

/**
 * Calling again with the same key aborts the previous signal.
 */
export default function globallyUnique<T>(
  key: string,
  fn: (options: {
    signal: AbortSignal;
    onDestroy: (callback: () => void) => void;
  }) => T,
): T {
  aborts[key]?.();
  const abortController = new AbortController();
  const signal = abortController.signal;
  aborts[key] = () => abortController.abort();

  function onDestroy(callback: () => void) {
    if (signal.aborted) {
      Promise.resolve().then(callback);
      return;
    }
    signal.addEventListener("abort", callback);
  }
  return fn({ signal, onDestroy });
}
