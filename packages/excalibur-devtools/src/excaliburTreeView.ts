import type { Entity, Scene } from "excalibur";
import errorBoundaryController from "ui-protocol/src/controllers/errorBoundaryController";
import treeViewController from "ui-protocol/src/controllers/treeViewController";
const win = window as any;

export default function excaliburTreeView(scene: Scene) {
  return errorBoundaryController(() =>
    treeViewController<Scene | Entity>({
      buffer: 3,

      getActive: (node) => node === win.$entity,
      getRoot: () => scene,
      getNestedKey(node, index) {
        return (node as Scene).entities[index];
      },
      getNestedCount(node) {
        if ("entities" in node) {
          return node.entities.length;
        }
        return 0;
      },
      getLabel(node) {
        if ("name" in node && node.name) {
          if (node.name === "Sprite") {
            return node.name;
          }
          if (node.constructor.name) {
            return `${node.constructor.name} "${node.name}"`;
          }
          return `"${node.name}"`;
        }
        return node.constructor?.name ?? "anonymous";
      },
      activate(node) {
        win.$entity = node;
      },
      lookup(key) {
        if ("scene" in key && key.scene) {
          return {
            parent: key.scene,
            index: key.scene.entities.indexOf(key),
          };
        }
      },
      ondblclick(node) {
        // eslint-disable-next-line no-console
        console.log(node);
      },
    }),
  );
}
