import { html } from "../html";

/** Angle delta in degrees */
export type GizmoRotateEvent = CustomEvent<number>;

export default class GizmoRotateElement extends HTMLElement {
  #root: ShadowRoot;
  #gizmo: HTMLElement;
  #ring: HTMLElement;
  #rotations: HTMLElement;
  #pie: HTMLElement;
  #from: HTMLElement;
  #to: HTMLElement;
  #line: HTMLElement;
  #delta: number;

  constructor() {
    super();

    this.#ring = html`<div class="ring"></div>`;
    this.#rotations = html`<div class="rotations"></div>`;
    this.#pie = html`<div class="pie"></div>`;
    this.#from = html`<div class="spoke"></div>`;
    this.#to = html`<div class="spoke"></div>`;
    this.#line = html`<div class="line"></div>`;
    this.#delta = 0;

    this.#gizmo = html`<div class="gizmo-rotate idle"></div>`;
    this.#gizmo.append(
      this.#rotations,
      this.#pie,
      this.#from,
      this.#to,
      this.#ring,
      this.#line,
    );

    this.#root = this.attachShadow({ mode: "open" });
    this.#root.append(createStylesheet(), this.#gizmo);

    this.#ring.addEventListener("mousedown", (e) => this.#dragStart(e));
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

  #pointerInfo(e: MouseEvent) {
    const center = this.#gizmo.getBoundingClientRect();
    const angle =
      (Math.atan2(e.clientY - center.y, e.clientX - center.x) / Math.PI) * 180;
    return {
      angle,
      distance: Math.hypot(e.clientX - center.x, e.clientY - center.y),
    };
  }
  #draw(from: number, delta: number) {
    const sweep = Math.abs(delta) % 360;
    const low = from - (delta < 0 ? sweep : 0);
    const high = low + sweep;

    this.#from.style.transform = `rotate(${low}deg)`;
    this.#to.style.transform = `rotate(${high}deg)`;
    this.#pie.style.background = `conic-gradient(from ${low + 90}deg, var(--pie) ${sweep}deg, transparent 0%)`;

    const rotations = Math.floor(Math.abs(delta) / 360);
    this.#rotations.style.opacity = `${1 - 0.5 ** rotations}`;
  }

  #dragStart(event: MouseEvent) {
    event.preventDefault();

    const abortController = new AbortController();
    const { signal } = abortController;

    signal.addEventListener("abort", () => {
      this.#gizmo.classList.add("idle");
      this.dispatchEvent(
        new CustomEvent("rotate-end", { detail: this.#delta }),
      );
    });

    const start = this.#pointerInfo(event);
    let previous = start.angle;
    this.#gizmo.classList.remove("idle");
    this.#delta = 0;
    this.#draw(start.angle, 0);
    this.#line.style.transform = `rotate(${start.angle}deg)`;
    this.#line.style.width = `${start.distance}px`;
    this.dispatchEvent(new CustomEvent("rotate-start", { detail: 0 }));

    window.addEventListener(
      "mousemove",
      (e: MouseEvent) => {
        const { angle, distance } = this.#pointerInfo(e);
        let step = angle - previous;
        if (step > 180) {
          step -= 360;
        }
        if (step < -180) {
          step += 360;
        }
        this.#delta += e.shiftKey ? step / 10 : step;
        previous = angle;
        const stepSize = e.shiftKey ? 1 : 5;
        const snapped = e.ctrlKey
          ? Math.round(this.#delta / stepSize) * stepSize
          : this.#delta;
        this.#draw(start.angle, snapped);
        this.#line.style.transform = `rotate(${angle}deg)`;
        this.#line.style.width = `${distance}px`;

        this.dispatchEvent(
          new CustomEvent("rotate-value", { detail: snapped }),
        );
      },
      { signal },
    );
    window.addEventListener("mouseup", () => abortController.abort(), {
      signal,
    });
    window.addEventListener(
      "keydown",
      (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          this.#delta = 0;
          abortController.abort();
        }
      },
      { signal },
    );
  }
}

function createStylesheet() {
  return html`
    <style>
      .gizmo-rotate {
        --diameter: 150px;
        --ring: #2c8fff;
        --pie: #cbcbcb;

        position: absolute;
      }

      .ring {
        position: absolute;
        top: calc(var(--diameter) / -2 - 3px);
        left: calc(var(--diameter) / -2 - 3px);
        width: var(--diameter);
        height: var(--diameter);
        border: 3px solid var(--ring);
        border-radius: 50%;
        opacity: 0.75;

        &:hover,
        :not(.idle) & {
          opacity: 1;
        }
      }

      .pie,
      .rotations {
        position: absolute;
        top: calc(var(--diameter) / -2);
        left: calc(var(--diameter) / -2);
        width: var(--diameter);
        height: var(--diameter);
        border-radius: 50%;
        pointer-events: none;
        background: var(--pie);
        opacity: 50%;

        .idle & {
          display: none;
        }
      }

      .spoke {
        position: absolute;
        top: -1px;
        left: 0;
        width: calc(var(--diameter) / 2);
        height: 2px;
        background: var(--ring);
        transform-origin: 0 1px;
        pointer-events: none;

        .idle & {
          display: none;
        }
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
    </style>
  `;
}
