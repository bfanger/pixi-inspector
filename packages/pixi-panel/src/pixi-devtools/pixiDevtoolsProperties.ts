import type { GameObjects } from "phaser";
import type { Application, DisplayObject } from "pixi.js";
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

  function directProp(
    object: any,
    property: keyof NodeProperties,
    type: "string" | "number" | "boolean",
  ): PropertyMapping[] {
    if (property in object && typeof object[property] === type) {
      return [
        {
          key: property,
          get: () => object[property],
          set: (value) => {
            // eslint-disable-next-line no-param-reassign
            object[property] = value;
          },
        },
      ];
    }
    return [];
  }

  function childProp(
    node: any,
    property: string,
    key: keyof NodeProperties,
    childProperty: string,
  ): PropertyMapping {
    return {
      key,
      get: () => node[property][childProperty],
      set: (value) => {
        // eslint-disable-next-line no-param-reassign
        node[property][childProperty] = value;
      },
    };
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
          get: () => object[nested][property],
          set: (value) => {
            // eslint-disable-next-line no-param-reassign
            object[nested][property] = value;
          },
        },
      ];
    }
    return [];
  }

  function validateNode(
    node: any,
    property: string,
    type: "string" | "number" | "boolean",
  ): boolean {
    return property in node && typeof node[property] === type;
  }

  function pointProperty(
    node: any,
    property: string,
    keyX: keyof NodeProperties,
    keyY: keyof NodeProperties,
    keyZ?: keyof NodeProperties,
  ): PropertyMapping[] {
    let propertyMap: PropertyMapping[] = [];
    if (
      property in node &&
      typeof node[property] === "object" &&
      validateNode(node[property], "x", "number") &&
      validateNode(node[property], "y", "number")
    ) {
      propertyMap = [
        childProp(node, property, keyX, "x"),
        childProp(node, property, keyY, "y"),
      ];
      if (validateNode(node[property], "z", "number") && keyZ) {
        propertyMap.push(childProp(node, property, keyZ, "z"));
      }
    }
    return propertyMap;
  }

  function quaternionProperty(
    node: any,
    property: string,
    keyX: keyof NodeProperties,
    keyY: keyof NodeProperties,
    keyZ: keyof NodeProperties,
    keyW: keyof NodeProperties,
  ): PropertyMapping[] {
    if (
      property in node &&
      typeof node[property] === "object" &&
      validateNode(node[property], "x", "number") &&
      validateNode(node[property], "y", "number") &&
      validateNode(node[property], "z", "number") &&
      validateNode(node[property], "w", "number")
    ) {
      return [
        childProp(node, property, keyX, "x"),
        childProp(node, property, keyY, "y"),
        childProp(node, property, keyZ, "z"),
        childProp(node, property, keyW, "w"),
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
      objectDefs.push(...directProp(node, "z", "number"));
      objectDefs.push(...directProp(node, "angle", "number"));
      objectDefs.push(
        ...pointProperty(node, "scale", "scaleX", "scaleY", "scaleZ"),
      );
      objectDefs.push(...directProp(node, "scaleX", "number"));
      objectDefs.push(...directProp(node, "scaleY", "number"));
      objectDefs.push(...directProp(node, "scaleZ", "number"));
      objectDefs.push(
        ...quaternionProperty(
          node,
          "rotationQuaternion",
          "quatX",
          "quatY",
          "quatZ",
          "quatW",
        ),
      );
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
        objectDefs.push({
          key: "originX",
          get: () => node.originX,
          set: (value) =>
            (node as GameObjects.Image).setOrigin(
              value,
              (node as GameObjects.Image).originY,
            ),
        });
        objectDefs.push({
          key: "originY",
          get: () => (node as GameObjects.Image).originY,
          set: (value) =>
            (node as GameObjects.Image).setOrigin(
              (node as GameObjects.Image).originX,
              value,
            ),
        });
      }
      if (devtools.isPixi(node as UniversalNode)) {
        const displayObject: DisplayObject = node as DisplayObject;
        if (typeof displayObject.eventMode === "string") {
          objectDefs.push(...directProp(node, "eventMode", "string"));
          objectDefs.push({
            key: "cursor",
            get: () => displayObject.cursor,
            set: (value) => {
              displayObject.cursor = value;
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

      // Scene
      const sceneDefs: PropertyMapping[] = [];
      sceneDefs.push(...nestedProp(node, "ticker", "speed", "number"));
      if (
        "ticker" in node &&
        "started" in node.ticker &&
        typeof node.ticker.started === "boolean" &&
        "start" in node &&
        typeof node.start === "function"
      ) {
        sceneDefs.push({
          key: "started",
          get: () => node.ticker.started,
          set: (value) => {
            if (value) {
              node.ticker.start();
            } else {
              node.ticker.stop();
            }
          },
        });
      }
      // eslint-disable-next-line no-param-reassign
      (node as any)[metaProperty] = {
        object: objectDefs,
        text: textDefs,
        scene: sceneDefs,
      };
    }
    return (node as any)[metaProperty];
  }

  let preferred: PropertyTab | undefined;

  function getActiveDefinition() {
    const definitions: Record<PropertyTab, PropertyMapping[]> = {
      object: [],
      text: [],
      scene: [],
    };
    const app = devtools.app();
    if (app) {
      const appDefinitions = getPropDefinition(app);
      definitions.scene.push(...appDefinitions.scene);
    }
    const node = devtools.selection.active();
    if (node) {
      const nodeDefinitions = getPropDefinition(node);
      definitions.object.push(...nodeDefinitions.object);
      definitions.text.push(...nodeDefinitions.text);
    }
    let active = preferred as PropertyTab;
    // definitions: Record<PropertyTab, PropertyMapping[]>
    if (!preferred || definitions[preferred].length === 0) {
      if (definitions.text.length !== 0) {
        active = "text";
      } else if (definitions.object.length !== 0) {
        active = "object";
      } else {
        active = "scene";
      }
    }
    return { definitions, active };
  }

  return {
    activate(group: PropertyTab) {
      preferred = group;
    },
    values(): PropertyTabState {
      const { definitions, active } = getActiveDefinition();
      const available: PropertyTab[] = [];
      for (const tab of Object.keys(definitions)) {
        if (definitions[tab as PropertyTab].length !== 0) {
          available.push(tab as PropertyTab);
        }
      }
      const properties: NodeProperties = {};
      for (let i = 0; i < definitions[active].length; i += 1) {
        const { key, get } = definitions[active][i];
        properties[key] = get();
      }

      return { tabs: available, active, properties };
    },

    set(property: string, value: number) {
      const { definitions, active } = getActiveDefinition();
      const definition = definitions[active].find(
        (entry) => entry.key === property,
      );
      if (definition) {
        definition.set(value);
      }
    },
  };
}
