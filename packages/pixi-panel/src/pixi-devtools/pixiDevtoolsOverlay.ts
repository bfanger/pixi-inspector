import type { GameObjects } from "phaser";
import type { DisplayObject, ICanvas, Matrix } from "pixi.js";
import type { PixiDevtools } from "../types";

export default function pixiDevtoolsOverlay(devtools: PixiDevtools) {
  function position(
    x: string,
    y: string,
    width: string,
    height: string
  ): Partial<CSSStyleDeclaration> {
    return {
      position: "absolute",
      left: x,
      top: y,
      width,
      height,
    };
  }
  function connect(el: HTMLCanvasElement | ICanvas | undefined) {
    if (!el) {
      return () => {};
    }
    const canvas = el as HTMLCanvasElement;

    const overlayEl = document.createElement("div");
    overlayEl.dataset.pixiDevtools = "overlay";
    Object.assign(overlayEl.style, {
      ...position("0", "0", "0", "0"),
      pointerEvents: "none",
      transformOrigin: "top left",
    });

    const highlightEl = document.createElement("div");
    highlightEl.dataset.pixiDevtools = "highlight";
    Object.assign(highlightEl.style, {
      ...position("0", "0", "0", "0"),
      transformOrigin: "top left",
      transform: "scale(0)",
    });

    const borderTop = document.createElement("div");
    borderTop.dataset.pixiDevtools = "borderTop";
    Object.assign(borderTop.style, {
      ...position("0", "-3px", "100%", "3px"),
      transformOrigin: "center bottom",
      background: "#ff9f2c",
    });
    const borderRight = document.createElement("div");
    borderRight.dataset.pixiDevtools = "borderRight";
    Object.assign(borderRight.style, {
      ...position("100%", "0", "3px", "100%"),
      transformOrigin: "center left",
      background: "#ff9f2c",
    });
    const borderBottom = document.createElement("div");
    borderBottom.dataset.pixiDevtools = "borderBottom";
    Object.assign(borderBottom.style, {
      ...position("0", "100%", "100%", "3px"),
      transformOrigin: "center top",
      background: "#ff9f2c",
    });
    const borderLeft = document.createElement("div");
    borderLeft.dataset.pixiDevtools = "borderLeft";
    Object.assign(borderLeft.style, {
      ...position("-3px", "0", "3px", "100%"),
      transformOrigin: "center right",
      background: "#ff9f2c",
    });

    const anchorEl = document.createElement("div");
    anchorEl.dataset.pixiDevtools = "anchor";
    Object.assign(anchorEl.style, {
      ...position("0", "0", "0", "0"),
      transformOrigin: "top left",
      transform: "scale(0)",
    });

    const dotEl = document.createElement("div");
    dotEl.dataset.pixiDevtools = "dot";
    Object.assign(dotEl.style, {
      ...position("-3px", "-3px", "6px", "6px"),
      background: "#ff9f2c",
      border: "1px solid #2a2b2b",
      borderRadius: "50%",
    });

    highlightEl.appendChild(borderTop);
    highlightEl.appendChild(borderRight);
    highlightEl.appendChild(borderBottom);
    highlightEl.appendChild(borderLeft);
    overlayEl.appendChild(highlightEl);
    anchorEl.appendChild(dotEl);
    overlayEl.appendChild(anchorEl);

    let prevSize = { width: -1, height: -1 };

    function calibrateOverlay() {
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
    let raf: number | undefined;
    function updateHighlight() {
      raf = requestAnimationFrame(updateHighlight);
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
      let unscale = { x: 1, y: 1 };
      if (
        "scale" in node &&
        typeof node.scale === "object" &&
        "x" in node.scale
      ) {
        unscale = { x: 1 / node.scale.x, y: 1 / node.scale.y };
      }
      borderTop.style.transform = `scale(1, ${unscale.y})`;
      borderRight.style.transform = `scale(${unscale.x}, 1)`;
      borderBottom.style.transform = `scale(1, ${unscale.y})`;
      borderLeft.style.transform = `scale(${unscale.x}, 1)`;

      if ("anchor" in node || "originX" in node) {
        anchorEl.style.transform = `matrix(${m.a}, ${m.b}, ${m.c}, ${m.d}, ${m.tx}, ${m.ty}) scale(${unscale.x}, ${unscale.y})`;
      } else {
        anchorEl.style.transform = "scale(0)";
      }
    }
    let parent: HTMLElement | null = canvas;
    while (parent) {
      parent = parent?.parentElement;
      if (parent?.tagName === "BODY") {
        parent.appendChild(overlayEl);
        updateHighlight();
        break;
      }
    }
    return () => {
      overlayEl.remove();
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }

  let previous = devtools.canvas();
  let cancel = connect(previous);
  setInterval(() => {
    const canvas = devtools.canvas();
    if (canvas !== previous) {
      previous = canvas;
      cancel();
      cancel = connect(canvas);
    }
  }, 2500);
}
