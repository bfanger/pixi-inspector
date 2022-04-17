<script lang="ts">
  import { onMount, update_slot } from "svelte/internal";

  import { getBridgeContext } from "./bridge-fns";
  import OutlineTree from "./OutlineTree.svelte";
  import type { OutlineNode } from "./types";

  const bridge = getBridgeContext();
  let promise: Promise<OutlineNode>;
  let stage: OutlineNode | undefined;

  async function update() {
    promise = bridge.execute<OutlineNode>("__PIXI_DEVTOOLS__.outlineTree()");
    stage = await promise;
  }
  update();

  async function expand(path: string[]) {
    await bridge.execute(
      `__PIXI_DEVTOOLS__.outlineExpand(${JSON.stringify(path)})`
    );
    update();
  }
  async function collapse(path: string[]) {
    await bridge.execute(
      `__PIXI_DEVTOOLS__.outlineCollapse(${JSON.stringify(path)})`
    );
    update();
  }
  onMount(() => {
    const timer = setInterval(() => {
      update();
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  });
</script>

{#if stage}
  <OutlineTree
    id={stage.id}
    name={stage.name}
    leaf={stage.leaf}
    active={stage.active}
    children={stage.children}
    on:expand={({ detail }) => expand(detail)}
    on:collapse={({ detail }) => collapse(detail)}
  />
{/if}
