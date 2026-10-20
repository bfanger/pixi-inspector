import { persistent } from "./storage";
import { getScreenLocation, setScreenLocation } from "../pixi-gizmo-fns";
import type GizmoToolbarElement from "blender-elements/src/gizmos/gizmo-toolbar";
import type GizmoMoveElement from "blender-elements/src/gizmos/gizmo-move";
import type { GizmoMoveEvent } from "blender-elements/src/gizmos/gizmo-move";
import type GizmoRotateElement from "blender-elements/src/gizmos/gizmo-rotate";
import type { GizmoRotateEvent } from "blender-elements/src/gizmos/gizmo-rotate";
import type { Sprite } from "pixi.js";
import type { UniversalNode } from "../types";

const localAngle = false;

export default function pixiDevtoolsGizmos(
  gizmos: HTMLElement,
  getSprite: () => Sprite,
) {
  const gizmoToolbar = document.createElement(
    "gizmo-toolbar",
  ) as GizmoToolbarElement;
  gizmoToolbar.style.pointerEvents = "auto";
  gizmoToolbar.value =
    persistent.get<GizmoToolbarElement["value"]>("gizmo:active") ?? "translate";
  gizmos.appendChild(gizmoToolbar);

  const gizmoRotate = document.createElement(
    "gizmo-rotate",
  ) as GizmoRotateElement;
  gizmoRotate.style.pointerEvents = "auto";
  gizmoRotate.hidden = true;
  gizmos.appendChild(gizmoRotate);

  let rotateStart: number | undefined;
  const gizmoMove = document.createElement("gizmo-move") as GizmoMoveElement;
  gizmoMove.style.pointerEvents = "auto";
  gizmoMove.hidden = true;

  gizmos.appendChild(gizmoMove);
  /** Show gizmo's based on the toolbar setting */
  function restoreVisibility() {
    const active = gizmoToolbar.value;
    gizmoMove.hidden = active !== "translate" && active !== "transform";
    gizmoRotate.hidden = active !== "rotate" && active !== "transform";
  }
  restoreVisibility();

  // Toolbar events
  window.addEventListener("keydown", (e) => {
    if (e.key === "t") {
      gizmoToolbar.hidden = !gizmoToolbar.hidden; // Toggle toolbar when pressing "t"
    }
  });
  gizmoToolbar.addEventListener("change", () => {
    restoreVisibility();
    persistent.set("gizmo:active", gizmoToolbar.value);
  });

  // Move events
  gizmoMove.addEventListener("move-start", () => {
    gizmoRotate.hidden = true;
  });
  gizmoMove.addEventListener("move-end", (e) => {
    const { detail } = e as GizmoMoveEvent;
    const sprite = getSprite();
    setScreenLocation(sprite, { x: detail.x, y: detail.y });
    restoreVisibility();
  });
  gizmoMove.addEventListener("move-value", (e) => {
    const { detail } = e as GizmoMoveEvent;
    const sprite = getSprite();
    setScreenLocation(sprite, { x: detail.x, y: detail.y });
  });

  // Rotate events
  gizmoRotate.addEventListener("rotate-start", () => {
    rotateStart = getSprite()?.rotation ?? 0;
    gizmoMove.hidden = true;
  });
  gizmoRotate.addEventListener("rotate-value", (e: Event) => {
    const sprite = getSprite();
    if (rotateStart !== undefined) {
      sprite.rotation =
        rotateStart + ((e as GizmoRotateEvent).detail * Math.PI) / 180;
    }
  });
  gizmoRotate.addEventListener("rotate-end", (e: Event) => {
    const sprite = getSprite();
    if (rotateStart !== undefined) {
      sprite.rotation =
        rotateStart + ((e as GizmoRotateEvent).detail * Math.PI) / 180;
    }
    rotateStart = undefined;
    restoreVisibility();
  });

  /** Synchronize the position of gizmo's to the position of the active sprite */
  return function updateGizmos(node: UniversalNode | undefined) {
    if (!isSprite(node) || persistent.get("gizmo:hidden")) {
      gizmos.hidden = true;
    } else {
      gizmos.hidden = false;
      const position = getScreenLocation(node);
      gizmoRotate.x = position.x;
      gizmoRotate.y = position.y;
      gizmoMove.x = position.x;
      gizmoMove.y = position.y;
      if (localAngle && node.parent) {
        const m = node.parent.worldTransform;
        gizmoMove.setAngle(Math.atan2(m.b, m.a));
      }
    }
  };
}

function isSprite(sprite: UniversalNode | undefined): sprite is Sprite {
  if (!sprite || !("parent" in sprite)) {
    return false;
  }
  if (typeof sprite?.position?.x !== "number") {
    return false;
  }
  return true;
}
