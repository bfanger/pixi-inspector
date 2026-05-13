import type { Application, Container } from "pixi.js";
import type {
  NodeProperties,
  PixiDevtools,
  PropertyTab,
  UniversalNode,
} from "../types";

type PropertyMapping<T = any> = {
  key: keyof NodeProperties;
  get: () => T;
  set: (value: T) => void;
};

export default function pixiDevtoolsProperties(devtools: PixiDevtools) {
  const metaProperty = Symbol("pixi-devtools-properties");

  function directProp(
    object: any,
    property: keyof NodeProperties,
    type: "string" | "number" | "boolean",
  ): PropertyMapping[] {
    if (property in object && typeof object[property] === type) {
      return [
        {
          key: property,
          get: () => object[property] as string | number | boolean,
          set: (value: string | number | boolean) => {
            object[property] = value;
          },
        },
      ];
    }
    return [];
  }

  function nestedProp(
    object: any,
    nested: string,
    property: keyof NodeProperties,
    type: "string" | "number" | "boolean",
  ): PropertyMapping[] {
    if (
      nested in object &&
      typeof object[nested] === "object" &&
      property in object[nested] &&
      typeof object[nested][property] === type
    ) {
      return [
        {
          key: property,
          get: () => object[nested][property] as string | number | boolean,
          set: (value: string | number | boolean) => {
            object[nested][property] = value;
          },
        },
      ];
    }
    return [];
  }

  function pointProperty(
    node: any,
    property: string,
    keyX: keyof NodeProperties,
    keyY: keyof NodeProperties,
  ): PropertyMapping[] {
    if (
      property in node &&
      typeof node[property] === "object" &&
      "x" in node[property] &&
      typeof node[property].x === "number" &&
      "y" in node[property] &&
      typeof node[property].y === "number"
    ) {
      return [
        {
          key: keyX,
          get: () => node[property].x as number,
          set: (value: number) => {
            node[property].x = value;
          },
        },
        {
          key: keyY,
          get: () => node[property].y as number,
          set: (value: number) => {
            node[property].y = value;
          },
        },
      ];
    }
    return [];
  }

  function getPropDefinition(
    node: UniversalNode | Application,
  ): Record<PropertyTab, PropertyMapping[]> {
    if (!(node as any)[metaProperty]) {
      const objectDefs: PropertyMapping[] = [];

      objectDefs.push(...directProp(node, "x", "number"));
      objectDefs.push(...directProp(node, "y", "number"));
      objectDefs.push(...directProp(node, "angle", "number"));
      objectDefs.push(...pointProperty(node, "scale", "scaleX", "scaleY"));
      objectDefs.push(...directProp(node, "scaleX", "number"));
      objectDefs.push(...directProp(node, "scaleY", "number"));
      objectDefs.push(...directProp(node, "width", "number"));
      objectDefs.push(...directProp(node, "height", "number"));
      objectDefs.push(...pointProperty(node, "anchor", "anchorX", "anchorY"));
      objectDefs.push(...pointProperty(node, "pivot", "pivotX", "pivotY"));
      objectDefs.push(...pointProperty(node, "skew", "skewX", "skewY"));
      objectDefs.push(...directProp(node, "alpha", "number"));
      objectDefs.push(...directProp(node, "visible", "boolean"));
      objectDefs.push(...directProp(node, "cullable", "boolean"));
      objectDefs.push(...directProp(node, "sortableChildren", "boolean"));
      objectDefs.push(...directProp(node, "zIndex", "number"));
      objectDefs.push(...directProp(node, "interactiveChildren", "boolean"));
      if (
        "originX" in node &&
        typeof node.originX === "number" &&
        "setOrigin" in node &&
        typeof node.setOrigin === "function"
      ) {
        const typedNode = node as UniversalNode & {
          originX: number;
          originY: number;
          setOrigin: (x?: number, y?: number) => unknown;
        };
        objectDefs.push({
          key: "originX",
          get: () => node.originX,
          set: (value) => typedNode.setOrigin(value, typedNode.originY),
        });
        objectDefs.push({
          key: "originY",
          get: () => typedNode.originY,
          set: (value) => typedNode.setOrigin(typedNode.originX, value),
        });
      }
      if (devtools.isPixi(node as UniversalNode)) {
        const container = node as Container;
        if (typeof container.eventMode === "string") {
          objectDefs.push(...directProp(node, "eventMode", "string"));
          objectDefs.push({
            key: "cursor",
            get: () => container.cursor,
            set: (value) => {
              container.cursor = value;
            },
          });
        } else {
          objectDefs.push(...directProp(node, "interactive", "boolean"));
          objectDefs.push(...directProp(node, "buttonMode", "boolean"));
        }
      }

      // Text
      const textDefs: PropertyMapping[] = [];

      textDefs.push(...directProp(node, "text", "string"));
      if (devtools.isPixi(node as UniversalNode)) {
        // Only for Pixi, updating style in Phaser has no effect
        textDefs.push(...nestedProp(node, "style", "align", "string"));
        textDefs.push(...nestedProp(node, "style", "breakWords", "boolean"));
        textDefs.push(...nestedProp(node, "style", "dropShadow", "boolean"));
        textDefs.push(
          ...nestedProp(node, "style", "dropShadowAlpha", "number"),
        );
        textDefs.push(
          ...nestedProp(node, "style", "dropShadowAngle", "number"),
        );
        textDefs.push(...nestedProp(node, "style", "dropShadowBlur", "number"));
        textDefs.push(
          ...nestedProp(node, "style", "dropShadowColor", "string"),
        );
        textDefs.push(
          ...nestedProp(node, "style", "dropShadowDistance", "number"),
        );
        textDefs.push(...nestedProp(node, "style", "fontFamily", "string"));
        textDefs.push(...nestedProp(node, "style", "fontSize", "number"));
        textDefs.push(...nestedProp(node, "style", "fontStyle", "string"));
        textDefs.push(...nestedProp(node, "style", "fontVariant", "string"));
        textDefs.push(...nestedProp(node, "style", "fontWeight", "string"));
        textDefs.push(...nestedProp(node, "style", "leading", "number"));
        textDefs.push(...nestedProp(node, "style", "letterSpacing", "number"));
        textDefs.push(...nestedProp(node, "style", "lineHeight", "number"));
        textDefs.push(...nestedProp(node, "style", "lineJoin", "string"));
        textDefs.push(...nestedProp(node, "style", "miterLimit", "number"));
        textDefs.push(...nestedProp(node, "style", "padding", "number"));
        textDefs.push(...nestedProp(node, "style", "stroke", "string"));
        textDefs.push(
          ...nestedProp(node, "style", "strokeThickness", "number"),
        );
        textDefs.push(...nestedProp(node, "style", "textBaseline", "string"));
        textDefs.push(...nestedProp(node, "style", "trim", "boolean"));
        textDefs.push(...nestedProp(node, "style", "whiteSpace", "string"));
        textDefs.push(...nestedProp(node, "style", "wordWrap", "boolean"));
        textDefs.push(...nestedProp(node, "style", "wordWrapWidth", "number"));
        textDefs.push(...nestedProp(node, "style", "fontSize", "number"));
        textDefs.push(...nestedProp(node, "style", "leading", "number"));
        textDefs.push(...nestedProp(node, "style", "padding", "number"));
      }

      (node as any)[metaProperty] = {
        object: objectDefs,
        text: textDefs,
      };
    }
    return (node as any)[metaProperty] as Record<
      PropertyTab,
      PropertyMapping[]
    >;
  }

  return {
    definitions() {
      const definitions: Record<PropertyTab, PropertyMapping[]> = {
        object: [],
        text: [],
      };
      const node = devtools.selection.active();
      if (node && (!("destroyed" in node) || !node.destroyed)) {
        const nodeDefinitions = getPropDefinition(node);
        definitions.object.push(...nodeDefinitions.object);
        definitions.text.push(...nodeDefinitions.text);
      }
      return definitions;
    },
  };
}
