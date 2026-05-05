import type { Entity, Scene } from "excalibur";
import errorBoundaryController from "ui-protocol/src/controllers/errorBoundaryController";
import treeViewController from "ui-protocol/src/controllers/treeViewController";
const win = window as any;

export default function excaliburTreeView(scene: Scene) {
  return errorBoundaryController(() =>
    treeViewController<Scene | Entity>({
      buffer: 3,

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
      syncProps(node, props) {
        props.active = node === win.$entity;
        if ("name" in node && node.name) {
          if (node.name === "Sprite") {
            props.label = node.name;
          } else if (node.constructor.name) {
            props.label = `${node.constructor.name} "${node.name}"`;
          } else {
            props.label = `"${node.name}"`;
          }
        } else {
          props.label = node.constructor?.name ?? "anonymous";
        }
      },
      activate(node) {
        win.$entity = node;
        return 1;
      },
      getIndex(parent, key) {
        return (parent as Scene).entities.indexOf(key as Entity);
      },
      ondblclick(node) {
        // eslint-disable-next-line no-console
        console.log(node);
      },
    }),
  );
}
