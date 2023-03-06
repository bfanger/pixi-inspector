import type { GameObjects } from "phaser";
import type { DisplayObject, Matrix } from "pixi.js";
import type { PixiDevtools } from "../types";

export default function pixiDevtoolsOverlay(devtools: PixiDevtools) {
  const overlayEl = document.createElement("div");
  Object.assign(overlayEl.style, {
    position: "absolute",
    top: "0",
    left: "0",
    pointerEvents: "none",
    transformOrigin: "top left",
  });
  const highlightEl = document.createElement("div");
  Object.assign(highlightEl.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: "0",
    height: "0",
    outline: "3px solid #ffaf29",
    transformOrigin: "top left",
    transform: "scale(0)",
  });
  overlayEl.appendChild(highlightEl);

  let prevSize = { width: -1, height: -1 };

  function calibrateOverlay() {
    const canvas = devtools.canvas() as HTMLCanvasElement;
    if (!canvas || !("getBoundingClientRect" in canvas)) {
      return;
    }
    const size = devtools.viewport.size();
    const scale = devtools.viewport.scale();
    if (!size || !scale) {
      return;
    }

    overlayEl.style.width = `${size.width / scale.x}px`;
    overlayEl.style.height = `${size.height / scale.y}px`;
    const canvasBounds = canvas.getBoundingClientRect();
    overlayEl.style.transform = "";
    const overlayBounds = overlayEl.getBoundingClientRect();
    overlayEl.style.transform = `translate(${
      canvasBounds.x - overlayBounds.x
    }px, ${canvasBounds.y - overlayBounds.y}px) scale(${
      canvasBounds.width / overlayBounds.width
    }, ${canvasBounds.height / overlayBounds.height})`;
  }
  let throttle = 0;
  function updateHighlight() {
    requestAnimationFrame(updateHighlight);
    const node = devtools.active();

    if (!node) {
      highlightEl.style.transform = "scale(0)";
      return;
    }
    const parent = devtools.parentOf(node);
    if (!parent || (node as DisplayObject).visible === false) {
      highlightEl.style.transform = "scale(0)";
      return;
    }
    if (throttle <= 0) {
      calibrateOverlay();
      throttle = 15;
    } else {
      throttle -= 1;
    }
    let size: { x: number; y: number; width: number; height: number };
    let m: Matrix | GameObjects.Components.TransformMatrix;
    if ("getLocalBounds" in node) {
      size = node.getLocalBounds();
      m = node.worldTransform;
    } else if ("getLocalTransformMatrix" in node && "width" in node) {
      const image = node as GameObjects.Image;
      size = {
        x: image.width / -2,
        y: image.height / -2,
        width: image.width,
        height: image.height,
      };
      m = image.getLocalTransformMatrix();
    } else {
      highlightEl.style.transform = "scale(0)";
      return;
    }
    if (prevSize.width !== size.width && prevSize.height !== size.width) {
      prevSize = size;
      highlightEl.style.width = `${size.width}px`;
      highlightEl.style.height = `${size.height}px`;
    }
    const offset = `translate(${size.x}px, ${size.y}px)`;
    highlightEl.style.transform = `matrix(${m.a}, ${m.b}, ${m.c}, ${m.d}, ${m.tx}, ${m.ty}) ${offset}`;
  }

  const canvas = devtools.canvas() as HTMLCanvasElement;
  let parent: HTMLElement | null = canvas;
  while (parent) {
    parent = parent?.parentElement;
    if (parent?.tagName === "BODY") {
      parent.appendChild(overlayEl);
      updateHighlight();
      break;
    }
  }
}
