export type { default as GizmoMoveElement } from "./gizmo-move";
export type { default as GizmoToolbarElement } from "./gizmo-toolbar";

import GizmoMoveElement from "./gizmo-move";
import GizmoToolbarElement from "./gizmo-toolbar";

export default function defineElements() {
  if (!customElements.get("gizmo-move")) {
    customElements.define("gizmo-move", GizmoMoveElement);
    customElements.define("gizmo-toolbar", GizmoToolbarElement);
  } else {
    console.warn("gizmo-elements already defined");
  }
}
