import { html } from "../html";

const stylesheet = html`
  <style>
    .gizmo-move {
      position: absolute;
    }

    .ring {
      position: absolute;
      top: -14px;
      left: -14px;
      box-sizing: border-box;
      width: 29px;
      height: 29px;
      border: 2px solid currentcolor;
      border-radius: 50%;
      color: #fff;
      opacity: 0.75;
    }

    .ring:hover {
      opacity: 1;
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
    }

    .arrow:hover,
    .arrow.dragging {
      opacity: 1;
    }

    .arrow:not(.dragging) .area {
      content: "";
      position: absolute;
      top: -13px;
      left: 15px;
      width: 84px;
      height: 27px;
      border-top-right-radius: 13px;
      border-bottom-right-radius: 13px;
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
        currentcolor 40%,
        currentcolor 60%,
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
      border-left: 18px solid currentcolor;
    }

    .arrow.dragging .dot {
      content: "";
      position: absolute;
      top: -3px;
      left: -3px;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentcolor;
    }
  </style>
`;

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

const xArrow = createArrow("#ff3752", 0);
const yArrow = createArrow("#7fcc1c", -90);
const ring = html`<div class="ring"></div>`;

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

export default class GizmoMoveElement extends HTMLElement {
  #shadow: ShadowRoot;
  #gizmo: HTMLElement;
  #ghost: HTMLElement | null = null;
  #axis: "x" | "y" | undefined;
  #dragging = false;
  #initial = { x: 0, y: 0 };

  #x = 0;
  #y = 0;

  static observedAttributes = ["x", "y"];

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: "open" });
    this.#shadow.append(stylesheet);

    this.#gizmo = html`<div class="gizmo-move"></div>`;
    this.#shadow.append(this.#gizmo);

    const xArrowClone = xArrow.cloneNode(true) as HTMLElement;
    const yArrowClone = yArrow.cloneNode(true) as HTMLElement;
    const ringClone = ring.cloneNode(true) as HTMLElement;

    xArrowClone.addEventListener("mousedown", (e) => this.#dragStart(e, "x"));
    yArrowClone.addEventListener("mousedown", (e) => this.#dragStart(e, "y"));
    ringClone.addEventListener("mousedown", (e) => this.#dragStart(e));

    this.#gizmo.append(xArrowClone, yArrowClone, ringClone);
  }

  connectedCallback() {
    this.#update();
  }

  attributeChangedCallback(_name: string, _old: string, newVal: string) {
    if (_name === "x") {
      this.#x = parseFloat(newVal) || 0;
    } else if (_name === "y") {
      this.#y = parseFloat(newVal) || 0;
    }
    this.#update();
  }

  set x(value: number) {
    this.#x = value;
    this.#update();
  }

  get y(): number {
    return this.#y;
  }
  set y(value: number) {
    this.#y = value;
    this.#update();
  }

  #update() {
    this.#gizmo.style.left = `${this.#x}px`;
    this.#gizmo.style.top = `${this.#y}px`;

    const ringEl = this.#gizmo.querySelector<HTMLElement>(".ring");
    if (ringEl) {
      ringEl.style.display =
        this.#dragging && this.#axis !== undefined ? "none" : "";
    }

    if (this.#ghost) {
      this.#ghost.style.left = `${this.#initial.x}px`;
      this.#ghost.style.top = `${this.#initial.y}px`;
    }

    const arrows = this.#gizmo.querySelectorAll(".arrow");
    arrows.forEach((arrow, i) => {
      const isX = i === 0;
      const isY = i === 1;
      if (this.#dragging && this.#axis === "x" && isX) {
        arrow.classList.add("dragging");
      } else if (this.#dragging && this.#axis === "y" && isY) {
        arrow.classList.add("dragging");
      } else {
        arrow.classList.remove("dragging");
      }
    });
  }

  #dragStart(event: MouseEvent, restrict?: "x" | "y") {
    event.preventDefault();
    this.#axis = restrict;
    this.#initial = { x: this.#x, y: this.#y };
    this.#dragging = true;

    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const initialX = this.#initial.x;
    const initialY = this.#initial.y;

    const drag = (e: MouseEvent) => {
      if (restrict === "x") {
        this.#x = initialX + (e.clientX - startClientX);
      } else if (restrict === "y") {
        this.#y = initialY + (e.clientY - startClientY);
      } else {
        this.#x = initialX + (e.clientX - startClientX);
        this.#y = initialY + (e.clientY - startClientY);
      }
      this.#update();
    };

    const dragEnd = () => {
      window.removeEventListener("mousemove", drag);
      window.removeEventListener("mouseup", dragEnd);
      this.#axis = undefined;
      this.#dragging = false;
      this.#ghost = null;
      this.#shadow.querySelector(".ghost")?.remove();
      this.#update();
    };

    window.addEventListener("mousemove", drag);
    window.addEventListener("mouseup", dragEnd);

    this.#ghost = createGhost(this.#axis);
    this.#ghost.style.left = `${this.#initial.x}px`;
    this.#ghost.style.top = `${this.#initial.y}px`;
    this.#shadow.append(this.#ghost);

    this.#update();
  }
}
