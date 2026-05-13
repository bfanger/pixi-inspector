import type { Entity, Scene } from "excalibur";
import errorBoundaryController from "ui-protocol/src/controllers/errorBoundaryController";
import treeViewController from "ui-protocol/src/controllers/treeViewController";
const win = window as any;

type OutlinerNode = Scene | Entity;

export default function excaliburTreeView(rootRef: { value: Scene }) {
  function getChildren(node: OutlinerNode) {
    if (node === rootRef.value) {
      return node.entities.filter((a) => !a.parent);
    }
    if ("children" in node) {
      return node.children;
    }
    return [];
  }

  return errorBoundaryController(() =>
    treeViewController<OutlinerNode>({
      buffer: 3,
      rootRef,
      getNestedKey: (node, index) => getChildren(node)[index],
      getNestedCount: (node) => getChildren(node).length,
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
      getIndex: (parent, key) => getChildren(parent).indexOf(key as Entity),
      ondblclick(node) {
        // eslint-disable-next-line no-console
        console.log(node);
      },
    }),
  );
}
