export type { default as GizmoMoveElement } from "./gizmo-move";
import GizmoMoveElement from "./gizmo-move";

export default function defineElements() {
  if (!customElements.get("gizmo-move")) {
    customElements.define("gizmo-move", GizmoMoveElement);
  } else {
    console.warn("<gizmo-move> already defined");
  }
}
