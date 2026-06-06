import { html } from "../html";

export default class GizmoMoveElement extends HTMLElement {
  #shadow: ShadowRoot;
  #arrowX: HTMLElement;
  #arrowY: HTMLElement;
  #ring: HTMLElement;
  #dragging = false;

  constructor() {
    super();

    this.#arrowX = createArrow("#ff3752", 0);
    this.#arrowY = createArrow("#7fcc1c", -90);
    this.#ring = html`<div class="ring"></div>`;

    this.#shadow = this.attachShadow({ mode: "open" });
    this.#shadow.append(
      createStylesheet(),
      this.#ring,
      this.#arrowX,
      this.#arrowY,
    );

    this.#arrowX.addEventListener("mousedown", (e) => this.#dragStart(e, "x"));
    this.#arrowY.addEventListener("mousedown", (e) => this.#dragStart(e, "y"));
    this.#ring.addEventListener("mousedown", (e) => this.#dragStart(e));
  }

  connectedCallback() {
    if (!this.style.position) {
      this.style.position = "absolute";
    }
  }

  getPosition() {
    return {
      x: parseInt(this.style.left) || 0,
      y: parseInt(this.style.top) || 0,
    };
  }

  setPosition(x: number, y: number) {
    if (this.#dragging) {
      return;
    }
    this.style.left = `${x}px`;
    this.style.top = `${y}px`;
  }

  #dragStart(event: MouseEvent, axis?: "x" | "y") {
    event.preventDefault();
    const start = {
      ...this.getPosition(),
      clientX: event.clientX,
      clientY: event.clientY,
    };
    let x = start.x;
    let y = start.y;
    this.#dragging = true;
    const ghost = createGhost(axis);
    this.#shadow.append(ghost);

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

    const drag = (e: MouseEvent) => {
      let deltaX = e.clientX - start.clientX;
      let deltaY = e.clientY - start.clientY;
      x = start.x + deltaX;
      y = start.y + deltaY;
      if (axis === "x") {
        y = start.y;
        deltaY = 0;
      } else if (axis === "y") {
        x = start.x;
        deltaX = 0;
      }
      this.style.left = `${x}px`;
      this.style.top = `${y}px`;
      ghost.style.left = `${-deltaX}px`;
      ghost.style.top = `${-deltaY}px`;

      this.dispatchEvent(new CustomEvent("gizmo-drag", { detail: { x, y } }));
    };

    const dragEnd = () => {
      this.#dragging = false;
      window.removeEventListener("mousemove", drag);
      window.removeEventListener("mouseup", dragEnd);
      ghost.remove();
      this.#ring.classList.remove("hidden", "dragging");
      this.#arrowY.classList.remove("hidden", "dragging");
      this.#arrowX.classList.remove("hidden", "dragging");
      this.dispatchEvent(
        new CustomEvent("gizmo-dragend", { detail: { x, y } }),
      );
    };

    window.addEventListener("mousemove", drag);
    window.addEventListener("mouseup", dragEnd);

    this.dispatchEvent(
      new CustomEvent("gizmo-dragstart", { detail: { x, y } }),
    );
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
