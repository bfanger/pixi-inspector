import defineElements, {
  type GizmoMoveElement,
} from "../../blender-elements/src/gizmos/defineElements";

defineElements();
const win = window as any;

const move = document.createElement("gizmo-move") as GizmoMoveElement;
move.addEventListener("gizmo-drag", (e) => {
  const pos = (e as CustomEvent).detail;
  win.$pixi.position.set(pos.x, pos.y);
});

let previous: any = undefined;
function sync() {
  if (typeof win.$pixi?.position?.x === "number") {
    move.setPosition(win.$pixi.position.x, win.$pixi.position.y);
  }
  if (!win.$pixi && previous) {
    move.remove();
  } else if (win.$pixi && !previous) {
    document.body.appendChild(move);
  }
  previous = win.$pixi;
  requestAnimationFrame(sync);
}
sync();
