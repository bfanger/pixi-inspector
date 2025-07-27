<script lang="ts">
  import Base from "blender-elements/src/Base.svelte";
  import Instructions from "./Instructions.svelte";
  import type { BridgeFn } from "./types";
  import { setBridgeContext } from "./bridge-fns";
  import { evalConnect } from "../../ui-protocol/src/evalBridge";
  import type { Connection } from "../../ui-protocol/src/types";
  import Warning from "./Warning.svelte";
  import Display from "../../ui-protocol/src/svelte/Display.svelte";
  type Props = {
    bridge: BridgeFn;
  };

  let { bridge }: Props = $props();

  setBridgeContext(bridge);

  let connectionPromise: Promise<Connection> = $state(
    evalConnect("pixi", bridge),
  );
</script>

<Base>
  {#await connectionPromise}
    <Instructions />
  {:then connection}
    <Display
      {connection}
      ondisconnect={() => {
        setTimeout(() => {
          connectionPromise = evalConnect("pixi", bridge);
        }, 1000);
      }}
    />
  {:catch err}
    <Warning message="Failed to connect: {err.message}" />
  {/await}
</Base>
