import Panel from "pixi-panel/PixiPanel.svelte";
import livereload from "./livereload";

declare const WATCH: string;

new Panel({
  target: document.body,
});

if (WATCH) {
  livereload();
}
