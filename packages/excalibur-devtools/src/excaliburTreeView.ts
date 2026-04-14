import type { Entity, Scene } from "excalibur";
import errorBoundaryNode from "ui-protocol/src/errorBoundaryNode";
import forEachNode from "ui-protocol/src/forEachNode";
import defineUI from "ui-protocol/src/svelte/defineUI";
const win = window as any;

export default function excaliburTreeView(scene: Scene) {
  let expanded = true;
  const previous = { expanded, active: win.$entity === undefined };
  return errorBoundaryNode(() => ({
    component: "TreeView",
    children: [
      {
        component: "TreeViewRow",
        props: { indent: 0, label: "Scene", ...previous },
        events: {
          onactivate() {
            win.$entity = undefined;
            return 2;
          },
          setExpanded(val) {
            expanded = val;
            return 2;
          },
          ondblclick() {
            // eslint-disable-next-line no-console
            console.log(scene);
          },
        },
        sync(patch) {
          patch.props = {
            indent: 0,
            label: "Scene",
            expanded,
            active: win.$entity === undefined,
          };
        },
      },
      forEachNode(
        () => (expanded ? scene.entities : []),
        (entity) => row(entity, 1),
      ),
    ],
  }));
}

function row(entity: Entity, indent: number) {
  const label = buildName(entity);
  let previous = { active: entity === win.$entity };

  return defineUI({
    component: "TreeViewRow",
    props: { indent, label, ...previous },
    events: {
      onactivate() {
        win.$entity = entity;
        return Infinity;
      },
      ondblclick() {
        // eslint-disable-next-line no-console
        console.log(entity);
      },
    },
    sync(patch) {
      const next = { active: entity === win.$entity };
      if (previous.active !== next.active) {
        patch.props = { indent, label, ...next };
        previous = next;
      }
    },
  });
}

function buildName(node: Entity): string {
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
}
