import { html } from "../html";

const tools = ["translate"] as const;
type ToolbarItem = (typeof tools)[number];

export default class GizmoToolbarElement extends HTMLElement {
  #shadow: ShadowRoot;
  #buttons!: Record<ToolbarItem, HTMLElement>;
  #value: ToolbarItem | "" = "";

  static get observedAttributes() {
    return ["value"];
  }

  constructor() {
    super();
    const toolbar = html`<div class="toolbar"></div>`;

    this.#buttons = {
      translate: html`<button class="tool-button">
        <svg viewBox="0 0 255 255">
          <path
            fill="#e5e5e5"
            d="m186 151 35-24-35-25zM154 120h24v13h-24zM103 185l24 35 25-35zM134 153v24h-13v-24zM69 102l-35 24 35 25zM101 133H77v-13h24zM152 68l-24-35-25 35zM121 100V76h13v24z"
          />
        </svg>
      </button>`,
    };
    this.#buttons["translate"].addEventListener("click", () => {
      if (this.#value === "translate") {
        this.value = "";
      } else {
        this.value = "translate";
      }
      this.dispatchEvent(new InputEvent("change", { data: this.#value }));
    });
    toolbar.append(this.#buttons["translate"]);

    this.#shadow = this.attachShadow({ mode: "open" });
    this.#shadow.append(createStylesheet(), toolbar);
  }

  connectedCallback() {
    if (!this.style.position) {
      this.style.position = "absolute";
    }
  }

  attributeChangedCallback(name: string, _old: string, next: string) {
    if (name === "value") {
      this.value = next as ToolbarItem;
    }
  }

  get value() {
    return this.#value;
  }

  set value(value: ToolbarItem | "") {
    if ((tools as readonly string[]).includes(value)) {
      this.#value = value;
    } else {
      this.#value = "";
    }
    for (const [tool, button] of Object.entries(this.#buttons)) {
      button.classList.toggle("active", tool === this.#value);
    }
  }
}

function createStylesheet() {
  return html`
    <style>
      .toolbar {
        display: flex;
        flex-direction: column;
      }
      .tool-button {
        width: 28px;
        height: 27px;
        background: #282828;
        appearance: none;
        border: none;
        padding: 0;
        border: 1px solid #3a3a3a;

        &:first-child {
          border-top-left-radius: 3px;
          border-top-right-radius: 3px;
        }
        &:last-child {
          border-bottom-left-radius: 3px;
          border-bottom-right-radius: 3px;
        }

        &:hover {
          background: #303030;
        }
        &.active,
        &:active {
          background: #5070ae;
        }

        svg {
          width: 27px;
          height: 27px;
        }
      }
    </style>
  `;
}
