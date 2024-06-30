import type { GameObjects } from "phaser";
import type { ICanvas, Matrix } from "pixi.js";
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
  function buildBorders(color: string) {
    const container = document.createElement("div");
    container.dataset.pixiDevtools = "border";
    Object.assign(container.style, {
      ...position("0", "0", "0", "0"),
      transformOrigin: "top left",
      transform: "scale(0)",
    });

    const top = document.createElement("div");
    const right = document.createElement("div");
    const bottom = document.createElement("div");
    const left = document.createElement("div");

    top.dataset.pixiDevtools = "borderTop";
    Object.assign(top.style, {
      ...position("0", "-3px", "100%", "3px"),
      transformOrigin: "center bottom",
      background: color,
    });
    right.dataset.pixiDevtools = "borderRight";
    Object.assign(right.style, {
      ...position("100%", "0", "3px", "100%"),
      transformOrigin: "center left",
      background: color,
    });
    bottom.dataset.pixiDevtools = "borderBottom";
    Object.assign(bottom.style, {
      ...position("0", "100%", "100%", "3px"),
      transformOrigin: "center top",
      background: color,
    });
    left.dataset.pixiDevtools = "borderLeft";
    Object.assign(left.style, {
      ...position("-3px", "0", "3px", "100%"),
      transformOrigin: "center right",
      background: color,
    });
    container.appendChild(top);
    container.appendChild(right);
    container.appendChild(bottom);
    container.appendChild(left);

    return {
      container,
      top,
      right,
      bottom,
      left,
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

    const highlight = document.createElement("div");
    highlight.dataset.pixiDevtools = "highlight";
    Object.assign(highlight.style, {
      ...position("0", "0", "0", "0"),
      transformOrigin: "top left",
      transform: "scale(0)",
      background: "rgba(102, 163, 218, 0.7)",
    });
    overlayEl.appendChild(highlight);

    const borders = buildBorders("#ff9f2c");
    overlayEl.appendChild(borders.container);

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
      background: "#ff9f2c",
      border: "1px solid #2a2b2b",
      borderRadius: "50%",
    });
    anchor.appendChild(dotEl);
    overlayEl.appendChild(anchor);

    function calibrateOverlay() {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!canvas || !("getBoundingClientRect" in canvas)) {
        return;
      }
      const size = devtools.viewport.size();
      const scale = devtools.viewport.renderScale();
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

    function calculateCss(node: UniversalNode | undefined) {
      /* eslint-disable no-param-reassign */
      if (!node) {
        return undefined;
      }
      const parent = devtools.parentOf(node);
      if (!parent) {
        return undefined;
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
        return undefined;
      }
      const offset = `translate(${size.x}px, ${size.y}px)`;
      const unscale = resolveScale(node);

      let anchorTransform = "scale(0)";

      if ("anchor" in node || "originX" in node || "pivot" in node) {
        let pivot = "";
        if ("pivot" in node) {
          pivot = `translate(${node.pivot.x}px, ${node.pivot.y}px)`;
        }
        anchorTransform = `matrix(${m.a}, ${m.b}, ${m.c}, ${m.d}, ${m.tx}, ${m.ty}) ${pivot} scale(${unscale.x}, ${unscale.y})`;
      }
      return {
        box: {
          width: `${size.width}px`,
          height: `${size.height}px`,
          transform: `matrix(${m.a}, ${m.b}, ${m.c}, ${m.d}, ${m.tx}, ${m.ty}) ${offset}`,
        },
        borderTop: `scale(1, ${Math.abs(unscale.y)})`,
        borderRight: `scale(${Math.abs(unscale.x)}, 1)`,
        borderBottom: `scale(1, ${Math.abs(unscale.y)})`,
        borderLeft: `scale(${Math.abs(unscale.x)}, 1)`,
        anchor: anchorTransform,
      };
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
      const activeCss = calculateCss(activeNode);
      if (activeCss) {
        borders.container.style.transform = activeCss.box.transform;
        borders.container.style.width = activeCss.box.width;
        borders.container.style.height = activeCss.box.height;
        borders.top.style.transform = activeCss.borderTop;
        borders.right.style.transform = activeCss.borderRight;
        borders.bottom.style.transform = activeCss.borderBottom;
        borders.left.style.transform = activeCss.borderLeft;
        anchor.style.transform = activeCss.anchor;
      } else {
        borders.container.style.transform = "scale(0)";
        anchor.style.transform = "scale(0)";
      }
      const highlightCss =
        activeNode === highlightNode ? activeCss : calculateCss(highlightNode);

      if (highlightCss) {
        highlight.style.transform = highlightCss.box.transform;
        highlight.style.width = highlightCss.box.width;
        highlight.style.height = highlightCss.box.height;
      } else {
        highlight.style.transform = "scale(0)";
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
