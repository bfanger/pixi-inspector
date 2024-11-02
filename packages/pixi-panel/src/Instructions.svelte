<script lang="ts">
  import Toggle from "blender-elements/src/Toggle/Toggle.svelte";
  import { getBridgeContext } from "./bridge-fns";

  const bridge = getBridgeContext();

  async function onCopy(text: string) {
    await bridge(`window.copy(${JSON.stringify(text)})`);
  }
</script>

<div class="instructions">
  <div class="engines">
    <div>
      Using <strong class="pixi">PixiJS</strong>?<br />
      After creating the <i>PIXI.Application</i>
      <code>const app = new PIXI.Application(...)</code>
      add the line:
      <code class="with-copy">
        <div class="copy">
          <Toggle
            icon="copy"
            hint="Copy to clipboard"
            transparent
            onclick={() => onCopy("globalThis.__PIXI_APP__ = app;")}
          />
        </div>
        globalThis.__PIXI_APP__ = app;</code
      >
      or when you're not using a PIXI.Application:

      <code>
        globalThis.__PIXI_STAGE__ = stage;<br />
        globalThis.__PIXI_RENDERER__ = renderer;
      </code>
    </div>
    <div>
      or when using <strong class="phaser">Phaser</strong><br />
      After creating the <i>Phaser.Game</i>
      <code>const game = new Phaser.Game(...)</code>
      add the line:
      <code class="with-copy"
        ><div class="copy">
          <Toggle
            icon="copy"
            hint="Copy to clipboard"
            transparent
            onclick={() => onCopy("globalThis.__PHASER_GAME__ = game;")}
          />
        </div>
        globalThis.__PHASER_GAME__ = game;</code
      >
    </div>
  </div>
</div>

<style>
  .instructions {
    padding: 12px;
  }
  code {
    background-color: #202020;
    color: rgb(145, 168, 203);
    margin-block: 8px;
  }
  .with-copy {
    position: relative;
    padding-right: 30px;
  }
  .copy {
    position: absolute;
    top: 6px;
    right: 6px;
  }
  .pixi {
    color: #df5584;
  }
  .phaser {
    color: #bb73d6;
  }
  .engines {
    display: flex;
    flex-direction: column;
    gap: 8px;
    @media (min-width: 700px) {
      flex-direction: row;
      gap: 64px;
    }
  }
</style>
