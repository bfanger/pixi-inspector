import { html } from "../html";

export default class GizmoRotateElement extends HTMLElement {
  #root: ShadowRoot;
  #gizmo: HTMLElement;
  #ring: HTMLElement;
  #rotations: HTMLElement;
  #pie: HTMLElement;
  #from: HTMLElement;
  #to: HTMLElement;
  #line: HTMLElement;

  constructor() {
    super();

    this.#ring = html`<div class="ring"></div>`;
    this.#rotations = html`<div class="rotations"></div>`;
    this.#pie = html`<div class="pie"></div>`;
    this.#from = html`<div class="spoke"></div>`;
    this.#to = html`<div class="spoke"></div>`;
    this.#line = html`<div class="line"></div>`;

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

  connectedCallback() {
    if (!this.style.position) {
      this.style.position = "absolute";
    }
  }
  set value(val: number) {
    this.setAttribute("value", `${val}`);
  }
  get value() {
    return parseFloat(this.getAttribute("value")!) || 0;
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
    this.#rotations.style.opacity = `${1 - 0.8 ** rotations}`;
  }

  #dragStart(event: MouseEvent) {
    event.preventDefault();

    const abortController = new AbortController();
    const { signal } = abortController;

    signal.addEventListener("abort", () => this.#gizmo.classList.add("idle"));

    const start = {
      ...this.#pointerInfo(event),
      value: this.value,
    };
    let total = 0;
    let previous = start.angle;
    this.#gizmo.classList.remove("idle");
    this.#draw(start.angle, 0);
    this.#line.style.transform = `rotate(${start.angle}deg)`;
    this.#line.style.width = `${start.distance}px`;

    window.addEventListener(
      "mousemove",
      (e: MouseEvent) => {
        const { angle, distance } = this.#pointerInfo(e);
        let delta = angle - previous;
        if (delta > 180) {
          delta -= 360;
        }
        if (delta < -180) {
          delta += 360;
        }
        total += e.shiftKey ? delta / 10 : delta;
        previous = angle;
        const step = e.shiftKey ? 1 : 5;
        const snapped = e.ctrlKey ? Math.round(total / step) * step : total;
        this.#draw(start.angle, snapped);
        this.#line.style.transform = `rotate(${angle}deg)`;
        this.#line.style.width = `${distance}px`;

        this.value = start.value + snapped;
        this.dispatchEvent(
          new InputEvent("input", { bubbles: true, composed: true }),
        );
      },
      { signal },
    );
    window.addEventListener(
      "mouseup",
      () => {
        this.dispatchEvent(
          new InputEvent("change", { bubbles: true, composed: true }),
        );
        abortController.abort();
      },
      { signal },
    );
    window.addEventListener(
      "keydown",
      (e: KeyboardEvent) => {
        if (e.key !== "Escape") {
          return;
        }
        this.value = start.value;
        this.dispatchEvent(
          new InputEvent("input", { bubbles: true, composed: true }),
        );
        abortController.abort();
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
        opacity: 20%;

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
