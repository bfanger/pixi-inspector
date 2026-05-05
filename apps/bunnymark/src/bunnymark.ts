import type { Container, DisplayObject } from "pixi.js";
import PIXI from "pixi.js";
import Stats from "stats.js";
import rootController from "../../../packages/ui-protocol/src/controllers/rootController";
import { evalListen } from "../../../packages/ui-protocol/src/evalBridge";
import refreshController from "../../../packages/ui-protocol/src/controllers/refreshController";
import treeViewController from "../../../packages/ui-protocol/src/controllers/treeViewController";

const width = 480;
const height = 320;

type Bunny = PIXI.Sprite & { speedX: number; speedY: number };
const bunnys: Bunny[] = [];
const gravity = 0.5; //1.5 ;

let maxX = width;
let minX = 0;
let maxY = height;
let minY = 0;

const startBunnyCount = 2;
let isAdding = false;
let count = 0;

let amount = 100;

const renderer = PIXI.autoDetectRenderer(800, 600, {
  backgroundColor: 0xffffff,
});
const stage = new PIXI.Container();

amount = renderer instanceof PIXI.WebGLRenderer ? 100 : 5;

if (amount === 5) {
  const canvasRenderer = renderer as PIXI.CanvasRenderer;
  canvasRenderer.context.imageSmoothingEnabled = false;
}

renderer.view.style["transform"] = "translatez(0)";
document.body.appendChild(renderer.view);
renderer.view.style.position = "absolute";
const stats = new Stats();

document.body.appendChild(stats.domElement);
stats.domElement.style.position = "absolute";
stats.domElement.style.top = "0px";
requestAnimationFrame(update);

const wabbitTexture = PIXI.Texture.fromImage("./bunnys.png");

const counter = document.createElement("div");
counter.className = "counter";
document.body.appendChild(counter);

// const pixiLogo = document.getElementById("pixi")!;
// const clickImage = document.getElementById("clickImage")!;

count = startBunnyCount;
counter.innerHTML = `${count} BUNNIES`;

const container = new PIXI.ParticleContainer(200000);

stage.addChild(container);
//var filter = new PIXI.filters.ColorMatrixFilter();

const bunny1 = new PIXI.Texture(
  wabbitTexture.baseTexture,
  new PIXI.Rectangle(2, 47, 26, 37),
);
const bunny2 = new PIXI.Texture(
  wabbitTexture.baseTexture,
  new PIXI.Rectangle(2, 86, 26, 37),
);
const bunny3 = new PIXI.Texture(
  wabbitTexture.baseTexture,
  new PIXI.Rectangle(2, 125, 26, 37),
);
const bunny4 = new PIXI.Texture(
  wabbitTexture.baseTexture,
  new PIXI.Rectangle(2, 164, 26, 37),
);
const bunny5 = new PIXI.Texture(
  wabbitTexture.baseTexture,
  new PIXI.Rectangle(2, 2, 26, 37),
);

const bunnyTextures = [bunny1, bunny2, bunny3, bunny4, bunny5];
let bunnyType = 2;
let currentTexture = bunnyTextures[bunnyType];

for (let i = 0; i < startBunnyCount; i++) {
  const bunny = new PIXI.Sprite(currentTexture) as Bunny;
  bunny.speedX = Math.random() * 10;
  bunny.speedY = Math.random() * 10 - 5;

  bunny.anchor.x = 0.5;
  bunny.anchor.y = 1;

  bunnys.push(bunny);

  container.addChild(bunny);
}
renderer.view.addEventListener(
  "mousedown",
  () => {
    isAdding = true;
  },
  { passive: true },
);

renderer.view.addEventListener(
  "mouseup",
  () => {
    bunnyType++;
    bunnyType %= 5;
    currentTexture = bunnyTextures[bunnyType];

    isAdding = false;
  },
  { passive: true },
);

document.addEventListener(
  "touchstart",
  () => {
    isAdding = true;
  },
  true,
);
document.addEventListener(
  "touchend",
  () => {
    bunnyType++;
    bunnyType %= 5;
    currentTexture = bunnyTextures[bunnyType];

    isAdding = false;
  },
  true,
);

resize();

function resize() {
  let width = window.innerWidth;
  let height = window.innerHeight;

  if (width > 800) {
    width = 800;
  }
  if (height > 600) {
    height = 600;
  }

  maxX = width;
  minX = 0;
  maxY = height;
  minY = 0;

  const w = window.innerWidth / 2 - width / 2;
  const h = window.innerHeight / 2 - height / 2;

  renderer.view.style.left = `${window.innerWidth / 2 - width / 2}px`;
  renderer.view.style.top = `${window.innerHeight / 2 - height / 2}px`;

  stats.domElement.style.left = `${w}px`;
  stats.domElement.style.top = `${h}px`;

  counter.style.left = `${w}px`;
  counter.style.top = `${h + 49}px`;

  renderer.resize(width, height);
}

function update() {
  stats.begin();
  if (isAdding) {
    if (count < 200000) {
      for (let i = 0; i < amount; i++) {
        const bunny = new PIXI.Sprite(currentTexture) as Bunny;
        bunny.speedX = Math.random() * 10;
        bunny.speedY = Math.random() * 10 - 5;
        bunny.anchor.y = 1;
        bunnys.push(bunny);
        bunny.scale.set(0.5 + Math.random() * 0.5);

        bunny.rotation = Math.random() - 0.5;

        container.addChild(bunny); //, random);

        count++;
      }
    }

    counter.innerHTML = `${count} BUNNIES`;
  }

  for (let i = 0; i < bunnys.length; i++) {
    const bunny = bunnys[i];

    bunny.position.x += bunny.speedX;
    bunny.position.y += bunny.speedY;
    bunny.speedY += gravity;

    if (bunny.position.x > maxX) {
      bunny.speedX *= -1;
      bunny.position.x = maxX;
    } else if (bunny.position.x < minX) {
      bunny.speedX *= -1;
      bunny.position.x = minX;
    }

    if (bunny.position.y > maxY) {
      bunny.speedY *= -0.85;
      bunny.position.y = maxY;
      if (Math.random() > 0.5) {
        bunny.speedY -= Math.random() * 6;
      }
    } else if (bunny.position.y < minY) {
      bunny.speedY = 0;
      bunny.position.y = minY;
    }
  }

  renderer.render(stage);
  requestAnimationFrame(update);
  stats.end();
}
type OutlineNode = Container | DisplayObject;

const testTreeViewController = true as boolean;
if (testTreeViewController === false) {
  (globalThis as any).__PIXI_STAGE__ = stage;
} else {
  const win = window as any;

  evalListen(
    "pixi",
    rootController(() => [
      refreshController({ interval: 1000, depth: 1 }),
      treeViewController<OutlineNode>({
        buffer: 10,
        getRoot: () => stage,
        getNestedCount: (node) => {
          if ("children" in node) {
            return node.children.length;
          }
          return 0;
        },
        getNestedKey(node, index) {
          const child = (node as Container).children[index];
          if (!child) {
            throw new Error(`Index ${index} is out of bounds`);
          }
          return child;
        },
        syncProps(node, props, parents) {
          props.active = node === win.$pixi;
          props.muted = node.visible ? parents.some((p) => !p.visible) : true;
          if ("name" in node && node.name) {
            if (node.constructor.name) {
              props.label = `${node.constructor.name} "${node.name}"`;
            } else {
              props.label = `"${node.name}"`;
            }
          } else {
            props.label = node.constructor.name ?? "anonymous";
          }
        },
        getIndex(parent, key) {
          return (parent as Container).children.indexOf(key);
        },
        activate(node) {
          win.$pixi = node;
          return 1;
        },
        ondblclick(node) {
          // eslint-disable-next-line no-console
          console.log(node);
        },
        onkeydown(node, event) {
          if (event.key === "h") {
            node.visible = !node.visible;
            return 1;
          }
        },
        initSlots(node, parents) {
          const props = {
            icon: node.visible
              ? ("eye-opened" as const)
              : ("eye-closed" as const),
            transparent: true,
            muted: parents.some((p) => !p.visible),
            hint: "",
          };
          return {
            children: [
              {
                component: "ToggleButton",
                props,
                events: {
                  onclick() {
                    node.visible = !node.visible;
                    return 2;
                  },
                },
                sync(patch) {
                  props.icon = node.visible ? "eye-opened" : "eye-closed";
                  props.hint = node.visible ? "Hide (h)" : "Show (h)";
                  props.muted = parents.some((p) => !p.visible);
                  patch.props = props;
                },
              },
            ],
          };
        },
      }),
    ]),
  );
}
