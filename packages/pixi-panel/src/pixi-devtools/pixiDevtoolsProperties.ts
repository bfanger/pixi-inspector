import type { GameObjects } from "phaser";
import type { ObservablePoint } from "pixi.js";
import type { NodeProperties, PixiDevtools, UniversalNode } from "../types";

type PropertyMapping<T = any> = {
  key: keyof NodeProperties;
  get(): T;
  set(value: T): void;
};

export default function pixiDevtoolsProperties(devtools: PixiDevtools) {
  const metaProperty = Symbol("pixi-devtools-properties");

  function getPropDefinition(node: UniversalNode): PropertyMapping[] {
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
      (node as any)[metaProperty] = definitions;
      // eslint-enable no-param-reassign
    }
    return (node as any)[metaProperty];
  }

  return {
    getAll(): NodeProperties | undefined {
      const node = devtools.active();
      if (!node) {
        return undefined;
      }
      const definition = getPropDefinition(node);
      const props: NodeProperties = {};
      for (let i = 0; i < definition.length; i += 1) {
        const { key, get } = definition[i];
        props[key] = get();
      }
      return props;
    },

    set(property: string, value: number) {
      const node = devtools.active();
      if (!node) {
        return;
      }
      const definition = getPropDefinition(node).find(
        (entry) => entry.key === property
      );
      if (definition) {
        definition.set(value);
      }
    },
  };
}
