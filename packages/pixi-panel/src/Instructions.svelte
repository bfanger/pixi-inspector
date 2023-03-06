<script>
  import ErrorMessage from "./ErrorMessage.svelte";
</script>

<div class="instructions">
  <div class="intro">
    <ErrorMessage>No Application or Game configured for debugging.</ErrorMessage
    >
  </div>
  <div class="engines">
    <div>
      Using <strong class="pixi">PixiJS</strong>?<br />
      After creating the <i>PIXI.Application</i>
      <code>const app = new PIXI.Application(...)</code>
      add the line:
      <code>globalThis.__PIXI_APP__ = app;</code>
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
      <code>globalThis.__PHASER_GAME__ = game;</code>
    </div>
  </div>
</div>

<style lang="scss">
  .instructions {
    padding: 12px;
  }
  .intro {
    margin-bottom: 16px;
  }
  code {
    background-color: #202020;
    color: rgb(145, 168, 203);
    margin-block: 8px;
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
