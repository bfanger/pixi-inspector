import { html } from "../html";

export type GizmoScaleData = {
  scaleX: number;
  scaleY: number;
};
export type GizmoScaleEvent = CustomEvent<GizmoScaleData>;

export default class GizmoScaleElement extends HTMLElement {
  #shadow: ShadowRoot;
  #gizmo: HTMLElement;
  #handleX: HTMLElement;
  #handleY: HTMLElement;
  #ring: HTMLElement;
  #line: HTMLElement;
  #abort: AbortController | undefined;

  constructor() {
    super();
    this.#gizmo = html`<div class="gizmo-scale idle"></div>`;
    this.#handleX = createHandle("#ff3752", 0);
    this.#handleY = createHandle("#7fcc1c", -90);
    this.#ring = html`<div class="ring">
      <div class="inner-ring"></div>
      <div class="outer-ring"></div>
    </div>`;
    this.#line = html`<div class="line"></div>`;
    this.#gizmo.append(this.#ring, this.#handleX, this.#handleY, this.#line);

    this.#shadow = this.attachShadow({ mode: "open" });
    this.#shadow.append(createStylesheet(), this.#gizmo);

    this.#handleX.addEventListener("mousedown", (e) => this.#dragStart(e, "x"));
    this.#handleY.addEventListener("mousedown", (e) => this.#dragStart(e, "y"));
    this.#ring.addEventListener("mousedown", (e) => this.#dragStart(e));
  }

  disconnectedCallback() {
    this.#abort?.abort("disconnected");
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
    this.#gizmo.style.left = `${value}px`;
  }

  get x(): number {
    return parseFloat(this.#gizmo.style.left) || 0;
  }

  set y(value: number) {
    this.#gizmo.style.top = `${value}px`;
  }

  get y(): number {
    return parseFloat(this.#gizmo.style.top) || 0;
  }

  #dragStart(event: MouseEvent, axis?: "x" | "y") {
    event.preventDefault();

    const getLocalPos = (clientX: number, clientY: number) => {
      const a = this.getAngle();
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      const relX = clientX - this.x;
      const relY = clientY - this.y;
      return {
        x: relX * cos + relY * sin,
        y: -relX * sin + relY * cos,
      };
    };

    const start = getLocalPos(event.clientX, event.clientY);
    const startDistance =
      axis === "x"
        ? start.x
        : axis === "y"
          ? start.y
          : Math.sqrt(start.x * start.x + start.y * start.y);

    if (startDistance === 0) {
      return;
    }
    this.#abort?.abort("start");
    this.#abort = new AbortController();
    const { signal } = this.#abort;
    const detail: GizmoScaleData = {
      scaleX: 1,
      scaleY: 1,
    };

    let scale = 1;
    let previousDistance = startDistance;

    const drawLine = (x: number, y: number) => {
      const angle = (Math.atan2(y, x) / Math.PI) * 180;
      this.#line.style.transform = `rotate(${angle}deg)`;
      this.#line.style.width = `${Math.hypot(x, y)}px`;
    };
    drawLine(start.x, start.y);

    signal.addEventListener("abort", () => {
      ghost.remove();
      this.#gizmo.style.setProperty("--scale", "1");
      this.#gizmo.classList.add("idle");
      this.#ring.classList.remove("hidden");
      this.#handleY.classList.remove("hidden");
      this.#handleX.classList.remove("hidden");
      this.#abort = undefined;

      this.dispatchEvent(new CustomEvent("scale-end", { detail }));
    });

    const ghost = createGhost(axis);
    this.#gizmo.append(ghost);

    this.#gizmo.classList.remove("idle");
    if (axis === "x") {
      this.#ring.classList.add("hidden");
      this.#handleY.classList.add("hidden");
    } else if (axis === "y") {
      this.#ring.classList.add("hidden");
      this.#handleX.classList.add("hidden");
    } else {
      this.#handleX.classList.add("hidden");
      this.#handleY.classList.add("hidden");
    }

    window.addEventListener(
      "mousemove",
      (e: MouseEvent) => {
        const { x, y } = getLocalPos(e.clientX, e.clientY);
        const distance =
          axis === "x"
            ? x
            : axis === "y"
              ? y
              : (x * start.x + y * start.y) / startDistance;

        const step = distance - previousDistance;
        previousDistance = distance;
        scale += (e.shiftKey ? step / 10 : step) / startDistance;

        const stepSize = e.shiftKey ? 0.02 : 0.1;
        const snapped = e.ctrlKey
          ? Math.round(scale / stepSize) * stepSize
          : scale;

        if (axis === "x") {
          detail.scaleX = snapped;
        } else if (axis === "y") {
          detail.scaleY = snapped;
        } else {
          detail.scaleX = snapped;
          detail.scaleY = snapped;
        }

        this.#gizmo.style.setProperty("--scale", String(snapped));
        drawLine(x, y);

        this.dispatchEvent(new CustomEvent("scale-value", { detail }));
      },
      { signal },
    );
    window.addEventListener("mouseup", () => this.#abort?.abort("end"), {
      signal,
    });
    window.addEventListener(
      "keydown",
      (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          detail.scaleX = 1;
          detail.scaleY = 1;
          this.#abort?.abort("escape");
        }
      },
      { signal },
    );
    this.dispatchEvent(new CustomEvent("scale-start", { detail }));
  }
}

function createHandle(color: string, rotate: number): HTMLElement {
  return html`<div
    class="handle"
    style="color: ${color}; transform: rotate(${rotate}deg)"
  >
    <div class="area"></div>
    <div class="dot"></div>
    <div class="handle-line"></div>
    <div class="handle-square"></div>
  </div>`;
}

function createGhost(axis: "x" | "y" | undefined): HTMLElement {
  const ghost = html`<div class="ghost"></div>`;

  if (axis === "x") {
    const ghostHandle = createHandle("#808080bf", 0);
    ghost.append(ghostHandle);
  } else if (axis === "y") {
    const ghostHandle = createHandle("#808080bf", -90);
    ghost.append(ghostHandle);
  } else {
    ghost.append(html`<div class="ring"><div class="inner-ring"></div></div>`);
  }

  return ghost;
}

function createStylesheet() {
  return html`
    <style>
      .gizmo-scale {
        position: absolute;
        isolation: isolate;
        --line: 75px;
        --inner-diameter: 29px;
        --outer-diameter: 180px;
        --scale: 1;
        &.combined {
          --line: 63px;
        }
      }

      .hidden {
        display: none;
      }

      .line {
        position: absolute;
        top: 0;
        left: 0;
        height: 1px;
        background: repeating-linear-gradient(
          to right,
          white 0 4px,
          transparent 4px 8px
        );
        transform-origin: 0 0;
        pointer-events: none;
        filter: drop-shadow(1px 1px 0 #0008);

        .idle & {
          display: none;
        }
      }

      .ring {
        opacity: 0.75;
        &:hover {
          opacity: 1;
        }
        .combined & {
          display: none;
        }
        .idle & {
          filter: drop-shadow(0px 0px 2px #0003);
        }
      }
      .inner-ring,
      .outer-ring {
        position: absolute;
        box-sizing: border-box;
        border: 2px solid currentColor;
        border-radius: 50%;
        color: #fff;
      }

      .inner-ring {
        --_size: var(--inner-diameter) * abs(var(--scale));
        top: calc(var(--_size) / -2 + 0.5px);
        left: calc(var(--_size) / -2 + 0.5px);
        width: calc(var(--_size));
        height: calc(var(--_size));
      }

      .outer-ring {
        top: calc(var(--outer-diameter) / -2 + 0.5px);
        left: calc(var(--outer-diameter) / -2 + 0.5px);
        width: var(--outer-diameter);
        height: var(--outer-diameter);

        .gizmo-scale:not(.idle) & {
          display: none;
        }
      }

      .ghost .inner-ring {
        color: #808080bf;
      }

      .ghost {
        pointer-events: none;
        position: absolute;
        --scale: 1;
      }

      .handle {
        position: absolute;
        left: 0;
        transform-origin: 0.5px 0.5px;
        width: 100px;
        height: 1px;
        opacity: 0.75;
        &:hover,
        .gizmo-scale:not(.idle) & {
          opacity: 1;
        }
      }

      .area {
        content: "";
        position: absolute;
        top: -9px;
        left: calc(var(--inner-diameter) / 2);
        width: calc((var(--outer-diameter) - var(--inner-diameter)) / 2);
        height: 19px;
      }

      .handle-line {
        content: "";
        position: absolute;
        top: -1px;
        right: calc(100px - var(--line));
        width: calc(var(--line) - 15px);
        height: 3px;
        background: linear-gradient(
          to bottom,
          transparent 0%,
          currentColor 40%,
          currentColor 60%,
          transparent 100%
        );

        .gizmo-scale:not(.idle) & {
          transform: scaleX(var(--scale));
          transform-origin: left;
          width: var(--line);
        }
      }

      .handle-square {
        content: "";
        position: absolute;
        top: -3px;
        left: calc(var(--line) * var(--scale) - 2px);
        width: 7px;
        height: 7px;
        background-color: currentColor;
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
