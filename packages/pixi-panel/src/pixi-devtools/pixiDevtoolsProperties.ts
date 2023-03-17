import type { NodeProperties, PixiDevtools, UniversalNode } from "../types";

type PropertyMapping = { key: keyof NodeProperties; path: string[] };

export default function pixiDevtoolsProperties(devtools: PixiDevtools) {
  const metaProperty = Symbol("pixi-devtools-properties");

  function getPropDefinition(node: UniversalNode): PropertyMapping[] {
    if (!(node as any)[metaProperty]) {
      const definitions: PropertyMapping[] = [];
      if ("x" in node && typeof node.x === "number") {
        definitions.push({ key: "x", path: ["x"] });
        definitions.push({ key: "y", path: ["y"] });
      }
      if ("angle" in node && typeof node.angle === "number") {
        definitions.push({ key: "angle", path: ["angle"] });
      }
      if ("scale" in node && typeof node.scale === "object") {
        definitions.push({ key: "scaleX", path: ["scale", "x"] });
        definitions.push({ key: "scaleY", path: ["scale", "y"] });
      } else if ("scaleX" in node && typeof node.scaleX === "number") {
        definitions.push({ key: "scaleX", path: ["scaleX"] });
        definitions.push({ key: "scaleY", path: ["scaleY"] });
      }
      if ("width" in node && typeof node.width === "number") {
        definitions.push({ key: "width", path: ["width"] });
        definitions.push({ key: "height", path: ["height"] });
      }
      if ("anchor" in node && typeof node.anchor === "object") {
        definitions.push({ key: "anchorX", path: ["anchor", "x"] });
        definitions.push({ key: "anchorY", path: ["anchor", "y"] });
      }
      if ("skew" in node && typeof node.skew === "object") {
        definitions.push({ key: "skewX", path: ["skew", "x"] });
        definitions.push({ key: "skewY", path: ["skew", "y"] });
      }
      if ("alpha" in node && typeof node.alpha === "number") {
        definitions.push({ key: "alpha", path: ["alpha"] });
      }
      // eslint-disable-next-line no-param-reassign
      (node as any)[metaProperty] = definitions;
    }
    return (node as any)[metaProperty];
  }

  function getProperty(node: any, path: string[]) {
    let val = node;
    for (let i = 0; i < path.length; i += 1) {
      val = val[path[i]];
    }
    return val;
  }

  function setProperty(node: any, path: string[], value: any) {
    let val = node;
    for (let i = 0; i < path.length - 1; i += 1) {
      val = val[path[i]];
    }
    val[path[path.length - 1]] = value;
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
        const { key, path } = definition[i];
        props[key] = getProperty(node, path);
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
        setProperty(node, definition.path, value);
      }
    },
  };
}
