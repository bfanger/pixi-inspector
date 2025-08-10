/**
 * Create a throttled version of a function.
 *
 * The invocation is instantaneous unless the function was called during the interval window.
 * The last invocation is guaranteed, but can be delayed.
 */
export default function throttle<
  T extends undefined | ((...args: any[]) => void),
>(intervalMs: number, fn: T): T {
  if (fn === undefined) {
    // Allowing undefined is convenient for converting eventHandlers.
    return undefined as T;
  }
  const name = fn.name ? `throttled_${fn.name}` : "throttled";
  let previousTime = 0;
  let latestArgs: any[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  const named = {
    [name](...args: any[]) {
      latestArgs = args;
      const now = Date.now();
      const elapsed = now - previousTime;
      if (elapsed > intervalMs) {
        if (timer === undefined) {
          previousTime = now;
          fn(...latestArgs);
        }
      } else {
        if (timer === undefined) {
          timer = setTimeout(() => {
            previousTime = Date.now();
            fn(...latestArgs);
            timer = undefined;
          }, intervalMs - elapsed);
        }
      }
    },
  };
  return named[name] as any as T;
}
