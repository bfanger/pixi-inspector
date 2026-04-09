<script lang="ts">
  import ToggleButton from "blender-elements/src/ToggleButton/ToggleButton.svelte";

  type Props = {
    copyToClipboard: (text: string) => void;
  };
  let { copyToClipboard }: Props = $props();
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
          <ToggleButton
            icon="copy"
            hint="Copy to clipboard"
            transparent
            onclick={() => copyToClipboard("globalThis.__PIXI_APP__ = app;")}
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
          <ToggleButton
            icon="copy"
            hint="Copy to clipboard"
            transparent
            onclick={() =>
              copyToClipboard("globalThis.__PHASER_GAME__ = game;")}
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
    font-size: 13px;
  }

  code {
    display: block;

    margin-block: 8px;
    padding: 8px;

    color: rgb(145 168 203);

    background-color: #202020;
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

    @media (width >= 700px) {
      flex-direction: row;
      gap: 64px;
    }
  }
</style>
