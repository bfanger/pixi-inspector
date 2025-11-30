<script lang="ts">
  /**
   * In UI-Protocol the Display must poll for the current value of the data/tree.
   *
   * The Refresh component allows:
   *  - The controller tree to specify the interval
   *  - Only requests sync when the Display is visible (raf)
   *  - Restarts the interval timer when the sync is performed.
   *    - Prevents excessive syncs when nesting Refresh nodes
   *    - Prevents queuing syncs, the timer waits until the controller tree was able to respond.
   */
  import { type Snippet } from "svelte";

  type Props = {
    interval: number;
    depth?: number;
    value: boolean; // For detecting the refresh
    refresh: (depth: number) => void;
    children: Snippet;
  };
  let { interval, depth, value, refresh, children }: Props = $props();

  let timer: number | undefined;

  function poll(current: number) {
    requestAnimationFrame(() => {
      if (current === timer) {
        refresh(depth ?? 0);
      }
    });
  }
  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    value; // React to value changes
    timer = window.setTimeout(() => poll(timer!), interval);

    return () => {
      clearTimeout(timer);
      timer = undefined;
    };
  });
</script>

{@render children()}
