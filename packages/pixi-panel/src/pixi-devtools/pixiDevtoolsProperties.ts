import type { GameObjects } from "phaser";
import type { Application, ObservablePoint } from "pixi.js";
import type {
  NodeProperties,
  PixiDevtools,
  UniversalNode,
  PropertyTab,
  PropertyTabState,
} from "../types";

type PropertyMapping<T = any> = {
  key: keyof NodeProperties;
  get(): T;
  set(value: T): void;
};

export default function pixiDevtoolsProperties(devtools: PixiDevtools) {
  const metaProperty = Symbol("pixi-devtools-properties");

  function getPropDefinition(
    node: UniversalNode | Application
  ): PropertyMapping[] {
    if (!(node as any)[metaProperty]) {
      /* eslint-disable no-param-reassign */
      const definitions: PropertyMapping[] = [];
      if ("x" in node && typeof node.x === "number") {
        definitions.push({
          key: "x",
          get: () => node.x,
          set: (value) => {
            node.x = value;
          },
        });
        definitions.push({
          key: "y",
          get: () => node.y,
          set: (value) => {
            node.y = value;
          },
        });
      }
      if ("angle" in node && typeof node.angle === "number") {
        definitions.push({
          key: "angle",
          get: () => node.angle,
          set: (value) => {
            node.angle = value;
          },
        });
      }
      if ("scale" in node && typeof node.scale === "object") {
        definitions.push({
          key: "scaleX",
          get: () => (node.scale as ObservablePoint).x,
          set: (value) => {
            (node.scale as ObservablePoint).x = value;
          },
        });
        definitions.push({
          key: "scaleY",
          get: () => (node.scale as ObservablePoint).y,
          set: (value) => {
            (node.scale as ObservablePoint).y = value;
          },
        });
      } else if ("scaleX" in node && typeof node.scaleX === "number") {
        definitions.push({
          key: "scaleX",
          get: () => node.scaleX,
          set: (value) => {
            node.scaleX = value;
          },
        });
        definitions.push({
          key: "scaleY",
          get: () => node.scaleY,
          set: (value) => {
            node.scaleY = value;
          },
        });
      }
      if ("width" in node && typeof node.width === "number") {
        definitions.push({
          key: "width",
          get: () => node.width,
          set: (value) => {
            node.width = value;
          },
        });
      }
      if ("height" in node && typeof node.height === "number") {
        definitions.push({
          key: "height",
          get: () => node.height,
          set: (value) => {
            node.height = value;
          },
        });
      }
      if ("anchor" in node && typeof node.anchor === "object") {
        definitions.push({
          key: "anchorX",
          get: () => (node.anchor as ObservablePoint).x,
          set: (value) => {
            (node.anchor as ObservablePoint).x = value;
          },
        });
        definitions.push({
          key: "anchorY",
          get: () => (node.anchor as ObservablePoint).y,
          set: (value) => {
            (node.anchor as ObservablePoint).y = value;
          },
        });
      }
      if ("pivot" in node && typeof node.pivot === "object") {
        definitions.push({
          key: "pivotX",
          get: () => (node.pivot as ObservablePoint).x,
          set: (value) => {
            (node.pivot as ObservablePoint).x = value;
          },
        });
        definitions.push({
          key: "pivotY",
          get: () => (node.pivot as ObservablePoint).y,
          set: (value) => {
            (node.pivot as ObservablePoint).y = value;
          },
        });
      }
      if (
        "originX" in node &&
        typeof node.originX === "number" &&
        "setOrigin" in node &&
        typeof node.setOrigin === "function"
      ) {
        definitions.push({
          key: "originX",
          get: () => node.originX,
          set: (value) =>
            (node as GameObjects.Image).setOrigin(
              value,
              (node as GameObjects.Image).originY
            ),
        });
        definitions.push({
          key: "originY",
          get: () => (node as GameObjects.Image).originY,
          set: (value) =>
            (node as GameObjects.Image).setOrigin(
              (node as GameObjects.Image).originX,
              value
            ),
        });
      }
      if ("skew" in node && typeof node.skew === "object") {
        definitions.push({
          key: "skewX",
          get: () => (node.skew as ObservablePoint).x,
          set: (value) => {
            (node.skew as ObservablePoint).x = value;
          },
        });
        definitions.push({
          key: "skewY",
          get: () => (node.skew as ObservablePoint).y,
          set: (value) => {
            (node.skew as ObservablePoint).y = value;
          },
        });
      }
      if ("alpha" in node && typeof node.alpha === "number") {
        definitions.push({
          key: "alpha",
          get: () => node.alpha,
          set: (value) => {
            node.alpha = value;
          },
        });
      }
      if ("visible" in node && typeof node.visible === "boolean") {
        definitions.push({
          key: "visible",
          get: () => node.visible,
          set: (value) => {
            node.visible = value;
          },
        });
      }
      if ("ticker" in node && typeof node.ticker === "object") {
        if ("speed" in node.ticker && typeof node.ticker.speed === "number") {
          definitions.push({
            key: "speed",
            get: () => node.ticker.speed,
            set: (value) => {
              node.ticker.speed = value;
            },
          });
        }
        if (
          "started" in node.ticker &&
          typeof node.ticker.started === "boolean" &&
          "start" in node &&
          typeof node.start === "function"
        ) {
          definitions.push({
            key: "paused",
            get: () => !node.ticker.started,
            set: (value) => {
              if (value) {
                node.ticker.stop();
              } else {
                node.ticker.start();
              }
            },
          });
        }
      }
      (node as any)[metaProperty] = definitions;
      // eslint-enable no-param-reassign
    }
    return (node as any)[metaProperty];
  }

  function getProperties(
    node: UniversalNode | Application
  ): NodeProperties | undefined {
    const definition = getPropDefinition(node);
    const props: NodeProperties = {};
    for (let i = 0; i < definition.length; i += 1) {
      const { key, get } = definition[i];
      props[key] = get();
    }
    return props;
  }
  let preferred: PropertyTab = "object";

  return {
    activate(group: PropertyTab) {
      preferred = group;
    },
    values(): PropertyTabState {
      const app = devtools.app();
      const node = devtools.selection.active();

      const available: PropertyTab[] = [];
      let selected = preferred;
      let properties: NodeProperties | undefined;

      if (app) {
        available.push("scene");
      }
      if (node) {
        available.push("object");
      }
      if (selected === "object" && node) {
        properties = getProperties(node);
      }
      if (selected === "object" && !node) {
        selected = "scene";
      }

      if (selected === "scene" && app) {
        properties = getProperties(app);
      }
      return { tabs: available, active: selected, properties };
    },

    set(property: string, value: number) {
      const node = devtools.selection.active();
      const app = devtools.app();
      let target: UniversalNode | Application | undefined = node;
      if (preferred === "scene" || !node) {
        target = app;
      }
      if (!target) {
        return;
      }
      const definition = getPropDefinition(target).find(
        (entry) => entry.key === property
      );
      if (definition) {
        definition.set(value);
      }
    },
  };
}
