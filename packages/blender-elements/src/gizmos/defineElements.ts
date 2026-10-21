export type { default as GizmoMoveElement } from "./gizmo-move";
export type { default as GizmoRotateElement } from "./gizmo-rotate";
export type { default as GizmoScaleElement } from "./gizmo-scale";
export type { default as GizmoToolbarElement } from "./gizmo-toolbar";

import GizmoMoveElement from "./gizmo-move";
import GizmoRotateElement from "./gizmo-rotate";
import GizmoScaleElement from "./gizmo-scale";
import GizmoToolbarElement from "./gizmo-toolbar";

export default function defineElements() {
  if (!customElements.get("gizmo-move")) {
    customElements.define("gizmo-move", GizmoMoveElement);
    customElements.define("gizmo-rotate", GizmoRotateElement);
    customElements.define("gizmo-scale", GizmoScaleElement);
    customElements.define("gizmo-toolbar", GizmoToolbarElement);
  } else {
    console.warn("gizmo-elements already defined");
  }
}
