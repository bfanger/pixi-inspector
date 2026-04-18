<script lang="ts">
  import Base from "blender-elements/src/Base.svelte";
  import Warning from "blender-elements/src/Warning/Warning.svelte";
  import Connect from "ui-protocol/src/svelte/Connect.svelte";
  import type { BridgeFn } from "ui-protocol/src/types";
  import TriggerProvider from "ui-protocol/src/svelte/TriggerProvider.svelte";
  import { SvelteSet } from "svelte/reactivity";
  import Instructions from "./Instructions.svelte";
  import "./components";

  type Props = {
    createListener: (
      setTargets: (targets: string[]) => void,
      setRefresh: (fn: () => void) => void,
    ) => () => void;
    createBridge: (target: string) => BridgeFn;
  };
  let { createListener, createBridge }: Props = $props();
  let targets: string[] = $state([""]);
  let available = new SvelteSet<string>();
  let refresh = $state<() => void>();
  let errorMessage = $state("");
  let active = $state<string>();
  let lines = $state<string[]>([]);
  let restoreTimer: number;
  let countdown = $state(0);
  let countdownTimer: number;

  $effect(() =>
    createListener(
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
  async function uiLegacy() {
    //@ts-ignore
    const module = await import("../build/ui-legacy.txt?raw");
    return module.default as string;
  }

  function addConnection(target: string) {
    available.add(target);
    active = target;
    errorMessage = "";
    clearTimeout(restoreTimer);
  }

  function onrestore() {
    clearTimeout(restoreTimer);
    lines = [];
  }

  function onerror(target: string, err: Error) {
    console.warn(err);
    clearTimeout(restoreTimer);
    refresh?.();
    restoreTimer = window.setTimeout(() => {
      errorMessage = err.message;
      if (active === target && !targets.includes(target)) {
        available.delete(target);
        active = undefined;
      }
      countdown = 5;
      setTimeout(() => {
        if ((errorMessage = err.message)) {
          errorMessage = "";
          lines = [];
        }
      }, 5_000);
    }, 1000);
  }

  function onlog(line: string) {
    lines.push(line);
  }

  $effect(() => {
    if (countdown <= 0) {
      return;
    }
    countdownTimer = window.setTimeout(() => {
      countdown -= 1;
    }, 1_000);
    return () => clearTimeout(countdownTimer);
  });
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
    <Warning
      icon="error"
      message={`${errorMessage} (Retrying in ${countdown} sec)`}
    />
  {:else if active === undefined}
    <Instructions />
  {:else}
    {#key active}
      {@const target = active}
      <Connect
        ui="pixi"
        inject={uiLegacy}
        bridge={createBridge(target)}
        {onlog}
        {onrestore}
        onerror={(err) => onerror(target, err)}
      />
    {/key}
  {/if}
  {#if lines.length > 0}
    <div class="log">
      <!-- eslint-disable-next-line svelte/require-each-key -->
      {#each lines as line}
        <div class="log-line">{line}</div>
      {/each}
    </div>
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

  .log {
    margin-top: 6px;
  }

  .log-line {
    padding: 3px 6px;
    color: #626262;
    background-color: #161616;

    &:nth-child(odd) {
      background-color: #1b1b1b;
    }
  }
</style>
