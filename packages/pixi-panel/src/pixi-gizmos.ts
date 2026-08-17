import defineElements, {
  type GizmoMoveElement,
} from "blender-elements/src/gizmos/defineElements";
import { getScreenLocation, setScreenLocation } from "./pixi-gizmo-fns";
import { persistent } from "./pixi-devtools/storage";

defineElements();
const win = window as any;
const localAngle = false;

export const gizmoMove = document.createElement(
  "gizmo-move",
) as GizmoMoveElement;
gizmoMove.addEventListener("gizmo-drag", (e) => {
  setScreenLocation(win.$pixi, (e as CustomEvent).detail);
});

function sync() {
  let hidden = persistent.get("gizmo:hidden");
  if (typeof win.$pixi?.position?.x === "number") {
    const position = getScreenLocation(win.$pixi);
    gizmoMove.setPosition(position.x, position.y);
    if (localAngle) {
      const m = win.$pixi.parent.worldTransform;
      gizmoMove.setAngle(Math.atan2(m.b, m.a));
    }
  } else if (!win.$pixi || !win.$pixi.parent) {
    hidden = true;
  }
  gizmoMove.style.display = hidden ? "none" : "";
  sync.previous = win.$pixi;
  requestAnimationFrame(sync);
}
sync.previous = undefined as any;

sync();
