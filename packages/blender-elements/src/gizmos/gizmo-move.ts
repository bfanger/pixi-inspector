import { html } from "../html";

/**
 * The movement in screen pixels
 */
export type GizmoMoveData = {
  x: number;
  y: number;
  from: { x: number; y: number };
  dx: number;
  dy: number;
  axis: "x" | "y" | undefined;
};
export type GizmoMoveEvent = CustomEvent<GizmoMoveData>;

export default class GizmoMoveElement extends HTMLElement {
  #shadow: ShadowRoot;
  #gizmo: HTMLElement;
  #arrowX: HTMLElement;
  #arrowY: HTMLElement;
  #ring: HTMLElement;
  #abortController: AbortController | undefined; // Will be undefined when not dragging

  constructor() {
    super();

    this.#gizmo = html`<div class="gizmo-move idle"></div>`;
    this.#arrowX = createArrow("#ff3752", 0);
    this.#arrowY = createArrow("#7fcc1c", -90);
    this.#ring = html`<div class="ring"></div>`;
    this.#gizmo.append(this.#arrowX, this.#arrowY, this.#ring);

    this.#shadow = this.attachShadow({ mode: "open" });
    this.#shadow.append(createStylesheet(), this.#gizmo);

    this.#arrowX.addEventListener("mousedown", (e) => this.#dragStart(e, "x"));
    this.#arrowY.addEventListener("mousedown", (e) => this.#dragStart(e, "y"));
    this.#ring.addEventListener("mousedown", (e) => this.#dragStart(e));
  }

  disconnectedCallback() {
    this.#abortController?.abort();
  }

  set combined(value: boolean) {
    this.#gizmo.classList.toggle("combined", value);
  }
  get combined(): boolean {
    return this.#gizmo.classList.contains("combined");
  }

  getAngle(): number {
    return parseFloat(this.style.rotate) || 0;
  }

  setAngle(rad: number) {
    this.style.rotate = `${rad}rad`;
  }

  set x(value: number) {
    if (this.#abortController) {
      return;
    }
    this.#gizmo.style.left = `${value}px`;
  }

  get x(): number {
    return parseFloat(this.#gizmo.style.left) || 0;
  }

  set y(value: number) {
    if (this.#abortController) {
      return;
    }
    this.#gizmo.style.top = `${value}px`;
  }

  get y(): number {
    return parseFloat(this.#gizmo.style.top) || 0;
  }

  #dragStart(event: MouseEvent, axis?: "x" | "y") {
    event.preventDefault();

    this.#abortController?.abort();
    this.#abortController = new AbortController();
    const { signal } = this.#abortController;

    let dx = 0;
    let dy = 0;
    const detail: GizmoMoveData = {
      from: { x: this.x, y: this.y },
      dx: 0,
      dy: 0,
      x: this.x,
      y: this.y,
      axis,
    };
    let previous = { x: event.clientX, y: event.clientY };
    let angle = this.getAngle();

    signal.addEventListener("abort", () => {
      ghost.remove();
      this.#gizmo.style.transform = "";
      this.#gizmo.style.left = `${detail.x}px`;
      this.#gizmo.style.top = `${detail.y}px`;
      this.#gizmo.classList.add("idle");
      this.#ring.classList.remove("hidden");
      this.#arrowY.classList.remove("hidden");
      this.#arrowX.classList.remove("hidden");
      this.#abortController = undefined;

      this.dispatchEvent(new CustomEvent("move-end", { detail }));
    });

    const ghost = createGhost(axis);
    this.#gizmo.append(ghost);
    this.#gizmo.classList.remove("idle");

    if (axis === "x") {
      this.#ring.classList.add("hidden");
      this.#arrowY.classList.add("hidden");
    } else if (axis === "y") {
      this.#ring.classList.add("hidden");
      this.#arrowX.classList.add("hidden");
    } else {
      this.#arrowX.classList.add("hidden");
      this.#arrowY.classList.add("hidden");
    }

    window.addEventListener(
      "mousemove",
      (e: MouseEvent) => {
        angle = this.getAngle();
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const clientDeltaX = e.clientX - previous.x;
        const clientDeltaY = e.clientY - previous.y;
        const scale = e.shiftKey ? 0.1 : 1;

        let deltaX = (clientDeltaX * cos + clientDeltaY * sin) * scale;
        let deltaY = (-clientDeltaX * sin + clientDeltaY * cos) * scale;
        if (axis === "x") {
          deltaY = 0;
        } else if (axis === "y") {
          deltaX = 0;
        }
        dx += deltaX;
        dy += deltaY;
        previous = { x: e.clientX, y: e.clientY };

        const step = e.shiftKey ? 1 : 10;
        detail.dx = e.ctrlKey ? Math.round(dx / step) * step : dx;
        detail.dy = e.ctrlKey ? Math.round(dy / step) * step : dy;
        detail.x = detail.from.x + detail.dx;
        detail.y = detail.from.y + detail.dy;

        this.#gizmo.style.transform = `translate(${detail.dx}px, ${detail.dy}px)`;
        ghost.style.transform = `translate(${-detail.dx}px, ${-detail.dy}px)`;
        this.dispatchEvent(
          new CustomEvent("move-value", {
            detail,
          }),
        );
      },
      { signal },
    );
    window.addEventListener("mouseup", () => this.#abortController?.abort(), {
      signal,
    });
    window.addEventListener(
      "keydown",
      (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          detail.dx = 0;
          detail.dy = 0;
          detail.x = detail.from.x;
          detail.y = detail.from.y;
          this.#abortController?.abort();
        }
      },
      { signal },
    );
    this.dispatchEvent(new CustomEvent("move-start", { detail }));
  }
}

function createArrow(color: string, rotate: number): HTMLElement {
  return html`<div
    class="arrow"
    style="color: ${color}; transform: rotate(${rotate}deg)"
  >
    <div class="area"></div>
    <div class="dot"></div>
    <div class="line"></div>
    <div class="triangle"></div>
  </div>`;
}

function createGhost(axis: "x" | "y" | undefined): HTMLElement {
  const ghost = html`<div class="ghost"></div>`;

  if (axis === "x") {
    const ghostArrow = createArrow("#808080bf", 0);
    ghost.append(ghostArrow);
  } else if (axis === "y") {
    const ghostArrow = createArrow("#808080bf", -90);
    ghost.append(ghostArrow);
  } else {
    ghost.append(html`<div class="ring"></div>`);
  }

  return ghost;
}

function createStylesheet() {
  return html`
    <style>
      .gizmo-move {
        position: absolute;
        isolation: isolate;
        --line: 100px;

        &.combined {
          --line: 112px;
        }
      }

      .hidden {
        display: none;
      }

      .ring {
        position: absolute;
        top: -14px;
        left: -14px;
        box-sizing: border-box;
        width: 29px;
        height: 29px;
        border: 2px solid currentColor;
        border-radius: 50%;
        color: #fff;
        opacity: 0.75;

        &:hover {
          opacity: 1;
        }

        .idle & {
          filter: drop-shadow(0px 0px 2px #0003);
        }
      }

      .ghost .ring {
        color: #808080bf;
      }

      .ghost {
        pointer-events: none;
        position: absolute;
      }

      .arrow {
        position: absolute;
        left: 0;
        transform-origin: 0.5px 0.5px;
        width: var(--line);
        height: 1px;
        opacity: 0.75;

        &:hover,
        .gizmo-move:not(.idle) & {
          opacity: 1;
        }

        .area {
          content: "";
          position: absolute;
          top: -13px;
          left: 15px;
          width: 84px;
          height: 27px;
          border-top-right-radius: 13px;
          border-bottom-right-radius: 13px;

          .combined & {
            left: auto;
            right: 0;
            width: 32px;
          }
        }
      }

      .line {
        content: "";
        position: absolute;
        top: -1px;
        left: 15px;
        right: 24px;
        height: 3px;
        background: linear-gradient(
          to bottom,
          transparent 0%,
          currentColor 40%,
          currentColor 60%,
          transparent 100%
        );

        .combined & {
          display: none;
        }
        .gizmo-move:not(.idle) & {
          left: 4px;
        }
      }

      .triangle {
        content: "";
        position: absolute;
        top: -4px;
        right: 6px;
        border-top: 5px solid transparent;
        border-bottom: 5px solid transparent;
        border-left: 18px solid currentColor;
      }

      .dot {
        content: "";
        position: absolute;
        top: -3px;
        left: -3px;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: currentColor;

        .idle & {
          display: none;
        }
      }
    </style>
  `;
}
