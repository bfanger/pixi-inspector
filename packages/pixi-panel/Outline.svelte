<script lang="ts">
  import { tick } from "svelte";
  import { getBridgeContext } from "./bridge-fns";
  import { OutlineNode } from "./types";

  export let path: string;
  export let level: number;

  const bridge = getBridgeContext();

  let promise: Promise<OutlineNode[]>;
  function update() {
    promise = bridge.eval<OutlineNode[]>(
      "__PIXI_APP__." +
        path +
        `.children.map(c => ({
          name: c.constructor.name,
          length: c.children.length,
          expanded: window['__PIXI_DEVTOOLS__'] && window['__PIXI_DEVTOOLS__'][${level}] === c
      }))`
    );
  }
  update();
  async function expand(index: number) {
    await bridge.eval(
      "(window['__PIXI_DEVTOOLS__'][" +
        level +
        "] = __PIXI_APP__." +
        path +
        ".children[" +
        index +
        "]) && true"
    );
    update();
  }
  async function collapse(index: number) {
    await bridge.eval("window['__PIXI_DEVTOOLS__'].length =  " + level);
    update();
  }
</script>

{#await promise then children}
  {#each children as { name, length, expanded }, index}
    <div>
      [{index}]
      {name}
      {#if length}
        ({length})
        {#if expanded}
          <button on:click={() => collapse(index)}>v</button>
          <svelte:self
            path={path + ".children[" + index + "]"}
            level={level + 1}
          />
        {:else}
          <button on:click={() => expand(index)}>&gt;</button>
        {/if}
      {/if}
    </div>
  {/each}
{/await}
