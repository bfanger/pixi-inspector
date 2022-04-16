import Panel from "pixi-panel/PixiPanel.svelte";
import livereload from "./livereload";
import bridge from "./bridge";

declare const WATCH: string;

new Panel({
  target: document.body,
  props: { bridge },
});

if (WATCH) {
  livereload();
}
