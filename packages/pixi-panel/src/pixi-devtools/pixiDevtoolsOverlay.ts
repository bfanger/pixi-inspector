import type { GameObjects } from "phaser";
import type { DisplayObject, Matrix } from "pixi.js";
import type { PixiDevtools } from "../types";

export default function pixiDevtoolsOverlay(devtools: PixiDevtools) {
  const overlayEl = document.createElement("div");
  overlayEl.dataset.pixiDevtools = "overlay";
  Object.assign(overlayEl.style, {
    position: "absolute",
    top: "0",
    left: "0",
    pointerEvents: "none",
    transformOrigin: "top left",
  });
  const highlightEl = document.createElement("div");
  highlightEl.dataset.pixiDevtools = "highlight";

  Object.assign(highlightEl.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: "0",
    height: "0",
    outline: "3px solid #ff9f2c",
    transformOrigin: "top left",
    transform: "scale(0)",
  });
  overlayEl.appendChild(highlightEl);

  const anchorEl = document.createElement("div");
  anchorEl.dataset.pixiDevtools = "anchor";
  Object.assign(anchorEl.style, {
    position: "absolute",
    top: "0px",
    left: "0px",
    width: "0px",
    height: "0px",
    transformOrigin: "top left",
    transform: "scale(0)",
  });
  overlayEl.appendChild(anchorEl);

  const dotEl = document.createElement("div");
  dotEl.dataset.pixiDevtools = "dot";
  Object.assign(dotEl.style, {
    position: "absolute",
    top: "-3px",
    left: "-3px",
    width: "6px",
    height: "6px",
    background: "#ff9f2c",
    border: "1px solid #2a2b2b",
    borderRadius: "50%",
  });
  anchorEl.appendChild(dotEl);

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
      anchorEl.style.transform = "scale(0)";
      return;
    }
    const parent = devtools.parentOf(node);
    if (!parent || (node as DisplayObject).visible === false) {
      highlightEl.style.transform = "scale(0)";
      anchorEl.style.transform = "scale(0)";
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
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      };
      if ("originX" in image) {
        size.x -= image.width * image.originX;
        size.y -= image.height * image.originY;
      }
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
    if ("anchor" in node || "originX" in node) {
      let unscale = "";
      if (
        "scale" in node &&
        typeof node.scale === "object" &&
        "x" in node.scale
      ) {
        unscale = `scale(${1 / node.scale.x}, ${1 / node.scale.y})`;
      }
      anchorEl.style.transform = `matrix(${m.a}, ${m.b}, ${m.c}, ${m.d}, ${m.tx}, ${m.ty}) ${unscale}`;
    } else {
      anchorEl.style.transform = "scale(0)";
    }
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
