<script lang="ts">
  import type { BridgeFn } from "./types";
  import connect from "./connect";
  import { setBridgeContext } from "./bridge-fns";
  import SceneGraph from "./SceneGraph.svelte";
  import Base from "blender-elements/Base.svelte";
  import Properties from "./Properties.svelte";

  export let bridge: BridgeFn;

  let refresh: () => void;

  const connection = connect(bridge);

  setBridgeContext(<T>(code: string) =>
    bridge<T>(code).catch((err) => {
      connection.retry();
      throw err;
    })
  );
</script>

<Base>
  {#if $connection}
    <div class="pixi-panel">
      <div class="outliner">
        <SceneGraph on:activate={refresh} />
      </div>
      <div class="properties">
        <Properties bind:refresh />
      </div>
    </div>
  {:else}
    <div class="info">
      <p>No Application or Game configured for debugging.</p>
      <div class="engines">
        <div>
          <strong style="color: #df5584">PixiJS</strong>: After creating the
          PIXI.Application
          <code>const app = new PIXI.Application(...);</code>
          add the line:
          <code>globalThis.__PIXI_APP__ = app;</code>
        </div>
        <div>
          <strong style="color: #bb73d6">Phaser</strong>: After creating the
          Phaser.Game
          <code>const game = new Phaser.Game(...);</code>
          add the line:
          <code>globalThis.__PHASER_GAME__ = game;</code>
        </div>
      </div>
    </div>
  {/if}
</Base>

<style lang="scss">
  :global {
    body {
      margin: 0;
      background: #161616;
      color: #e5e5e5;
    }
    code {
      display: block;
      padding: 8px;
    }
  }
  .pixi-panel {
    display: grid;
    grid-template-rows: 1fr minmax(200px, 35%);
    grid-template-columns: 1fr;
    height: 100%;
    gap: 3px;
    @media (min-width: 600px) {
      grid-template-rows: 1fr;
      grid-template-columns: 1fr minmax(300px, 40%);
    }
  }
  .outliner {
    overflow: auto;
    background: #303030;
  }
  .properties {
    background: #303030;
  }
  .info {
    padding: 8px;
    code {
      background-color: #202020;
      color: #74a5ee;
      margin-block: 8px;
    }
  }
  .engines {
    display: flex;
    flex-direction: column;
    gap: 16px;
    @media (min-width: 700px) {
      flex-direction: row;
      gap: 32px;
    }
  }
</style>
