<script lang="ts">
  import Base from "blender-elements/src/Base.svelte";
  import Warning from "blender-elements/src/Warning/Warning.svelte";
  import SelectMenu from "blender-elements/src/SelectMenu/SelectMenu.svelte";
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
  let updateController = new AbortController();

  $effect(() =>
    createListener(
      async (update) => {
        updateController.abort();
        updateController = new AbortController();
        let uniqueTargets = [""];
        const variable = `window[${JSON.stringify(`__pixi_connect_${Math.random().toString(16).substring(2, 8)}`)}]`;
        createBridge("")(`${variable} = ""`);
        const signal = updateController.signal;
        for (const target of update) {
          if (target === "") {
            continue;
          }
          try {
            const value = await createBridge(target)<string>(
              `${variable} = ${variable} ?? ${JSON.stringify(target)};`,
            );
            if (value === target) {
              uniqueTargets.push(target);
            }
          } catch (err) {
            console.warn(`Error connecting to ${target}:`, err);
          }
          if (signal.aborted) {
            return;
          }
        }
        targets = uniqueTargets;
        for (const target of uniqueTargets) {
          createBridge(target)<string>(`delete ${variable}`);
        }
        for (const target of available) {
          if (!uniqueTargets.includes(target)) {
            removeConnection(target);
          }
        }
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

  function removeConnection(target: string) {
    available.delete(target);
    if (active === target) {
      active = available.values().next().value;
    }
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
      if (active === target) {
        errorMessage = err.message;
        countdown = 5;
      }
      if (!targets.includes(target)) {
        lines = [];
        removeConnection(target);
      }
    }, 1000);
  }

  function onlog(line: string) {
    lines.push(line);
  }

  $effect(() => {
    if (countdown <= 0) {
      errorMessage = "";
      lines = [];
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
    {#if !available.has(target)}
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
    <div class="pixi-panel">
      {#if available.size > 1}
        <SelectMenu
          bind:value={active}
          options={Array.from(available).map((target) =>
            target === "" ? { value: "", label: "top" } : target,
          )}
        />
      {/if}
      <div class="connected-target">
        {#key active}
          {@const target = active}
          <Connect
            ui="pixi"
            inject={uiLegacy}
            bridge={createBridge(target)}
            {onlog}
            {onrestore}
            onerror={(err: any) => onerror(target, err)}
          />
        {/key}
      </div>
    </div>
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

  .pixi-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .connected-target {
    flex: 1;
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
