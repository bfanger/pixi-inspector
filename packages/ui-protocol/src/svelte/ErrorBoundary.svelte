<script lang="ts">
  import Warning from "blender-elements/src/Warning/Warning.svelte";
  import { onDestroy, type Snippet } from "svelte";

  type Props = {
    restored: number;
    onrestore: (value: number) => void;
    onerror: () => void;
    createTrigger?: (setError: (message?: string) => void) => void;
    children: Snippet;
  };
  let { restored, onerror, onrestore, createTrigger, children }: Props =
    $props();
  let error = $state<{ message?: string }>();
  let triggered = 0;
  let timer: number;
  let svelteReset: undefined | (() => void);

  $effect(() => {
    if (restored !== 0 && restored === triggered) {
      triggered = 0;
      error = undefined;
      clearTimeout(timer);
      svelteReset?.();
      svelteReset = undefined;
    }
  });

  function setError(message?: string) {
    error = { message };
    if (triggered) {
      return;
    }
    triggered = 1 + Math.random();
    onerror();
    timer = window.setTimeout(() => {
      onrestore(triggered);
    }, 3_000);
  }

  $effect.pre(() => {
    createTrigger?.(setError);
  });

  onDestroy(() => clearTimeout(timer));

  function svelteError(err: unknown, reset: () => void) {
    console.error(err);
    svelteReset = reset;
    setError(err instanceof Error ? err.message : undefined);
  }
</script>

{#if error}
  <Warning message={error.message || "An error occurred"} />
{/if}
<svelte:boundary onerror={svelteError}>{@render children()}</svelte:boundary>
