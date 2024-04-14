import type { GameObjects } from "phaser";
import type { Container, ICanvas, Matrix } from "pixi.js";
import type { PixiDevtools, UniversalNode } from "../types";

export default function pixiDevtoolsOverlay(devtools: PixiDevtools) {
  function position(
    x: string,
    y: string,
    width: string,
    height: string,
  ): Partial<CSSStyleDeclaration> {
    return {
      position: "absolute",
      left: x,
      top: y,
      width,
      height,
    };
  }
  function buildNodeOverlay(color: string) {
    const border = document.createElement("div");
    border.dataset.pixiDevtools = "border";
    Object.assign(border.style, {
      ...position("0", "0", "0", "0"),
      transformOrigin: "top left",
      transform: "scale(0)",
    });

    const anchor = document.createElement("div");
    anchor.dataset.pixiDevtools = "anchor";
    Object.assign(anchor.style, {
      ...position("0", "0", "0", "0"),
      transformOrigin: "top left",
      transform: "scale(0)",
    });

    const dotEl = document.createElement("div");
    dotEl.dataset.pixiDevtools = "dot";
    Object.assign(dotEl.style, {
      ...position("-4px", "-4px", "6px", "6px"),
      transformOrigin: "top left",
      background: color,
      border: "1px solid #2a2b2b",
      borderRadius: "50%",
    });
    anchor.appendChild(dotEl);

    const borderTop = document.createElement("div");
    const borderRight = document.createElement("div");
    const borderBottom = document.createElement("div");
    const borderLeft = document.createElement("div");

    borderTop.dataset.pixiDevtools = "borderTop";
    Object.assign(borderTop.style, {
      ...position("0", "-3px", "100%", "3px"),
      transformOrigin: "center bottom",
      background: color,
    });
    borderRight.dataset.pixiDevtools = "borderRight";
    Object.assign(borderRight.style, {
      ...position("100%", "0", "3px", "100%"),
      transformOrigin: "center left",
      background: color,
    });
    borderBottom.dataset.pixiDevtools = "borderBottom";
    Object.assign(borderBottom.style, {
      ...position("0", "100%", "100%", "3px"),
      transformOrigin: "center top",
      background: color,
    });
    borderLeft.dataset.pixiDevtools = "borderLeft";
    Object.assign(borderLeft.style, {
      ...position("-3px", "0", "3px", "100%"),
      transformOrigin: "center right",
      background: color,
    });
    border.appendChild(borderTop);
    border.appendChild(borderRight);
    border.appendChild(borderBottom);
    border.appendChild(borderLeft);

    return {
      anchor,
      border,
      borderTop,
      borderRight,
      borderBottom,
      borderLeft,
    };
  }

  function resolveScale(node: UniversalNode) {
    const unscale = { x: 1, y: 1 };
    let parentNode: UniversalNode = node;
    do {
      if (
        "scaleX" in parentNode &&
        typeof parentNode.scaleX === "number" &&
        "scaleY" in parentNode &&
        typeof parentNode.scaleY === "number"
      ) {
        unscale.x /= parentNode.scaleX;
        unscale.y /= parentNode.scaleY;
      } else if (
        "scale" in parentNode &&
        typeof parentNode.scale === "object" &&
        "x" in parentNode.scale
      ) {
        unscale.x /= parentNode.scale.x;
        unscale.y /= parentNode.scale.y;
      }
      parentNode = devtools.parentOf(parentNode) as UniversalNode;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } while (parentNode);
    return unscale;
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

    const highlightNodeOverlay = buildNodeOverlay("#4772b3");
    overlayEl.appendChild(highlightNodeOverlay.border);
    overlayEl.appendChild(highlightNodeOverlay.anchor);

    const activeNodeOverlay = buildNodeOverlay("#ff9f2c");
    overlayEl.appendChild(activeNodeOverlay.border);
    overlayEl.appendChild(activeNodeOverlay.anchor);

    function calibrateOverlay() {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

    function updateBox(
      node: UniversalNode | undefined,
      {
        anchor,
        border,
        borderTop,
        borderRight,
        borderBottom,
        borderLeft,
      }: ReturnType<typeof buildNodeOverlay>,
    ) {
      /* eslint-disable no-param-reassign */
      if (!node) {
        anchor.style.transform = "scale(0)";
        border.style.transform = "scale(0)";
        return;
      }
      const parent = devtools.parentOf(node);
      if (!parent || (node as Container).visible === false) {
        anchor.style.transform = "scale(0)";
        border.style.transform = "scale(0)";
        return;
      }

      let size: { x: number; y: number; width: number; height: number };
      let m: Matrix | GameObjects.Components.TransformMatrix;
      if ("getLocalBounds" in node) {
        size = node.getLocalBounds();
        m = node.worldTransform;
      } else if ("getLocalTransformMatrix" in node && "width" in node) {
        const image = node as any as GameObjects.Image;
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
        border.style.transform = "scale(0)";
        return;
      }
      border.style.width = `${size.width}px`;
      border.style.height = `${size.height}px`;
      const offset = `translate(${size.x}px, ${size.y}px)`;
      border.style.transform = `matrix(${m.a}, ${m.b}, ${m.c}, ${m.d}, ${m.tx}, ${m.ty}) ${offset}`;

      const unscale = resolveScale(node);

      borderTop.style.transform = `scale(1, ${Math.abs(unscale.y)})`;
      borderRight.style.transform = `scale(${Math.abs(unscale.x)}, 1)`;
      borderBottom.style.transform = `scale(1, ${Math.abs(unscale.y)})`;
      borderLeft.style.transform = `scale(${Math.abs(unscale.x)}, 1)`;

      if ("anchor" in node || "originX" in node || "pivot" in node) {
        let pivot = "";
        if ("pivot" in node) {
          pivot = `translate(${node.pivot.x}px, ${node.pivot.y}px)`;
        }
        anchor.style.transform = `matrix(${m.a}, ${m.b}, ${m.c}, ${m.d}, ${m.tx}, ${m.ty}) ${pivot} scale(${unscale.x}, ${unscale.y})`;
      } else {
        anchor.style.transform = "scale(0)";
      }
    }

    function updateOverlay() {
      raf = requestAnimationFrame(updateOverlay);
      const activeNode = devtools.selection.active();
      const highlightNode = devtools.selection.highlighted();

      if (throttle <= 0) {
        if (activeNode || highlightNode) {
          calibrateOverlay();
          throttle = 15;
        }
      } else {
        throttle -= 1;
      }
      updateBox(activeNode, activeNodeOverlay);
      if (activeNode !== highlightNode) {
        updateBox(highlightNode, highlightNodeOverlay);
      } else {
        highlightNodeOverlay.anchor.style.transform = "scale(0)";
        highlightNodeOverlay.border.style.transform = "scale(0)";
      }
    }
    let parent: HTMLElement | null = canvas;
    while (parent) {
      parent = parent.parentElement;
      if (parent?.tagName === "BODY") {
        parent.appendChild(overlayEl);
        updateOverlay();
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
