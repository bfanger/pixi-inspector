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
  #dragging: AbortController | undefined;

  constructor() {
    super();

    this.#arrowX = createArrow("#ff3752", 0);
    this.#arrowY = createArrow("#7fcc1c", -90);
    this.#ring = html`<div class="ring"></div>`;
    this.#gizmo = html`<div class="gizmo-move"></div>`;
    this.#gizmo.append(this.#ring, this.#arrowX, this.#arrowY);

    this.#shadow = this.attachShadow({ mode: "open" });
    this.#shadow.append(createStylesheet(), this.#gizmo);

    this.#arrowX.addEventListener("mousedown", (e) => this.#dragStart(e, "x"));
    this.#arrowY.addEventListener("mousedown", (e) => this.#dragStart(e, "y"));
    this.#ring.addEventListener("mousedown", (e) => this.#dragStart(e));
  }

  disconnectedCallback() {
    this.#dragging?.abort();
  }

  getAngle(): number {
    return parseFloat(this.style.rotate) || 0;
  }

  setAngle(rad: number) {
    this.style.rotate = `${rad}rad`;
  }

  set x(value: number) {
    if (this.#dragging) {
      return;
    }
    this.#gizmo.style.left = `${value}px`;
  }

  get x(): number {
    return parseFloat(this.#gizmo.style.left) || 0;
  }

  set y(value: number) {
    if (this.#dragging) {
      return;
    }
    this.#gizmo.style.top = `${value}px`;
  }

  get y(): number {
    return parseFloat(this.#gizmo.style.top) || 0;
  }

  #dragStart(event: MouseEvent, axis?: "x" | "y") {
    event.preventDefault();

    this.#dragging = new AbortController();
    const { signal } = this.#dragging;

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
      this.#ring.classList.remove("hidden", "dragging");
      this.#arrowY.classList.remove("hidden", "dragging");
      this.#arrowX.classList.remove("hidden", "dragging");
      this.#dragging = undefined;

      this.dispatchEvent(new CustomEvent("move-end", { detail }));
    });

    const ghost = createGhost(axis);
    this.#gizmo.append(ghost);

    if (axis === "x") {
      this.#arrowX.classList.add("dragging");
      this.#ring.classList.add("hidden");
      this.#arrowY.classList.add("hidden");
    } else if (axis === "y") {
      this.#arrowY.classList.add("dragging");
      this.#ring.classList.add("hidden");
      this.#arrowX.classList.add("hidden");
    } else {
      this.#ring.classList.add("dragging");
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
        this.dispatchEvent(
          new CustomEvent("move-value", {
            detail,
          }),
        );
      },
      { signal },
    );
    window.addEventListener("mouseup", () => this.#dragging?.abort(), {
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
          this.#dragging?.abort();
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
    ghostArrow.classList.add("dragging");
    ghost.append(ghostArrow);
  } else if (axis === "y") {
    const ghostArrow = createArrow("#808080bf", -90);
    ghostArrow.classList.add("dragging");
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

        &:not(.dragging) {
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
        width: 100px;
        height: 1px;
        opacity: 0.75;

        &:hover,
        &.dragging {
          opacity: 1;
        }

        &:not(.dragging) .area {
          content: "";
          position: absolute;
          top: -13px;
          left: 15px;
          width: 84px;
          height: 27px;
          border-top-right-radius: 13px;
          border-bottom-right-radius: 13px;
        }
      }

      .line {
        content: "";
        position: absolute;
        top: -1px;
        right: 24px;
        width: 61px;
        height: 3px;
        background: linear-gradient(
          to bottom,
          transparent 0%,
          currentColor 40%,
          currentColor 60%,
          transparent 100%
        );
      }

      .arrow.dragging .line {
        width: 72px;
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

      .arrow.dragging .dot {
        content: "";
        position: absolute;
        top: -3px;
        left: -3px;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: currentColor;
      }
    </style>
  `;
}
