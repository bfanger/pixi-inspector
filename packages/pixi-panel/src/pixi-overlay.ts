import defineElements, {
  type GizmoMoveElement,
} from "../../blender-elements/src/gizmos/defineElements";

defineElements();
const move = document.createElement("gizmo-move") as GizmoMoveElement;
move.x = 40;
move.y = 40;
document.body.appendChild(move);
