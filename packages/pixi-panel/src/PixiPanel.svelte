<script lang="ts">
  import { fade } from "svelte/transition";
  import type { BridgeFn } from "./types";
  import Base from "blender-elements/src/Base.svelte";
  import Warning from "blender-elements/src/Warning/Warning.svelte";
  import Connect from "./Connect.svelte";
  import TriggerProvider from "ui-protocol/src/svelte/TriggerProvider.svelte";
  import { SvelteSet } from "svelte/reactivity";
  import Instructions from "./Instructions.svelte";
  import "./components";

  type Props = {
    listen: (
      setTargets: (targets: string[]) => void,
      setRefresh: (fn: () => void) => void,
    ) => () => void;
    createBridge: (target: string) => BridgeFn;
  };
  let { listen: handleTargets, createBridge }: Props = $props();
  let targets: string[] = $state([]);
  let available = new SvelteSet<string>();
  let refresh = $state<() => void>();
  let errorMessage = $state("");
  let active = $state<string>();

  $effect(() =>
    handleTargets(
      (update) => {
        targets = update;
      },
      (fn) => {
        refresh = fn;
      },
    ),
  );

  async function uiConnect() {
    //@ts-ignore
    const module = await import("../build/ui-connect.txt?raw");
    return module.default as string;
  }
  async function miniUI() {
    //@ts-ignore
    const module = await import("../build/ui-mini.txt?raw");
    return module.default as string;
  }
  let timer: number;

  function addConnection(target: string) {
    available.add(target);
    active = target;
    errorMessage = "";
    clearTimeout(timer);
  }

  function onrestore() {
    clearTimeout(timer);
  }

  function onerror(target: string, err: Error) {
    console.warn(err);
    clearTimeout(timer);
    refresh?.();
    timer = window.setTimeout(() => {
      errorMessage = err.message;
      if (active === target && !targets.includes(target)) {
        available.delete(target);
        active = undefined;
      }
    }, 1000);
  }
</script>

<Base>
  {#each targets as target (target)}
    {#if target !== active}
      <TriggerProvider ontrigger={() => addConnection(target)}>
        <Connect
          ui="connect"
          inject={uiConnect}
          bridge={createBridge(target)}
        />
      </TriggerProvider>
    {/if}
  {/each}

  {#if errorMessage}
    <Warning message={errorMessage} />
  {:else if active === undefined}
    <Instructions bridge={createBridge("")} />
  {:else}
    {#key active}
      {@const target = active}
      <Connect
        ui="pixi"
        inject={miniUI}
        bridge={createBridge(target)}
        {onrestore}
        onerror={(err) => onerror(target, err)}
      >
        <div in:fade={{ delay: 1000, duration: 100 }}>
          <Warning message="Connecting taking longer than expected..." />
        </div>
      </Connect>
    {/key}
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
