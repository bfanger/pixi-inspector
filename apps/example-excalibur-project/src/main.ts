import { Engine } from "excalibur";
import { Resources, loader } from "./resources";
import excaliburDevtools from "excalibur-devtools/src/excaliburDevtools";

const game = new Engine({
  width: 800,
  height: 600,
  canvasElementId: "game",
  pixelArt: true,
  pixelRatio: 2,
  suppressPlayButton: true,
});
excaliburDevtools(game);

game.start(loader).then(() => {
  Resources.TiledMap.addToScene(game.currentScene);
});
