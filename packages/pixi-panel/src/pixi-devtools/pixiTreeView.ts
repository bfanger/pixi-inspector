import treeViewController from "ui-protocol/src/controllers/treeViewController";
import type { PixiDevtools, UniversalNode } from "../types";
import ifController from "ui-protocol/src/controllers/ifController";

export default function pixiTreeView(legacy: PixiDevtools) {
  const win = window as any;
  const jumpToRef = { key: undefined as UniversalNode | undefined };
  let previous$pixi: UniversalNode | undefined;
  return ifController(
    () => {
      if (previous$pixi !== win.$pixi) {
        jumpToRef.key = win.$pixi;
        previous$pixi = win.$pixi;
      }
      return legacy.outline.query ? false : legacy.root();
    },
    (rootRef) => {
      const getLabel =
        "label" in rootRef.value
          ? (node: UniversalNode) => {
              if ("label" in node && node.label) {
                if (node.label === "Sprite") {
                  return node.label;
                }
                if (node.constructor.name) {
                  return `${node.constructor.name} "${node.label}"`;
                }
                return `"${node.label}"`;
              }
              return node.constructor.name ?? "anonymous";
            }
          : (node: UniversalNode) => {
              if ("name" in node && node.name) {
                if (node.constructor.name) {
                  return `${node.constructor.name} "${node.name}"`;
                }
                return `"${node.name}"`;
              }
              return node.constructor.name ?? "anonymous";
            };

      return treeViewController<UniversalNode>({
        buffer: 10,
        rootRef,
        jumpToRef,
        getNestedCount: (node: UniversalNode) => {
          if ("children" in node) {
            return node.children.length;
          }
          return 0;
        },
        getNestedKey(node: UniversalNode, index: number): UniversalNode {
          if (!("children" in node)) {
            throw new Error("Can't call getNestedKey() on a leaf node");
          }
          const child = Array.isArray(node.children)
            ? node.children[index]
            : node.children.list[index];
          if (!child) {
            throw new Error(`Index ${index} is out of bounds`);
          }
          return child;
        },
        syncProps(node: UniversalNode, props: any, parents: UniversalNode[]) {
          props.label = getLabel(node);
          props.active = node === win.$pixi;
          if ("visible" in node) {
            props.muted = node.visible
              ? parents.some((p) => "visible" in p && !p.visible)
              : true;
          }
        },
        getIndex(parent: UniversalNode, key: UniversalNode): number {
          if (!("children" in parent)) {
            throw new Error("Can't call getIndex() on a leaf node");
          }
          return "getIndex" in parent.children
            ? parent.children.getIndex(key as any)
            : parent.children.indexOf(key as any);
        },
        activate(node: UniversalNode) {
          win.$pixi = node;
          previous$pixi = node;
          return 1;
        },
        ondblclick(node: UniversalNode) {
          // eslint-disable-next-line no-console
          console.log(node);
        },
        onmouseenter(key) {
          legacy.selection.highlight(key);
        },
        onmouseleave() {
          legacy.selection.highlight(undefined);
        },
        onkeydown(node: UniversalNode, event: { key: string }) {
          if (event.key === "h" && "visible" in node) {
            node.visible = !node.visible;
            return 1;
          }
        },
        initSlots(node: UniversalNode, parents: UniversalNode[]) {
          const selectableProps = {
            transparent: true,
            hint: "Disable right-click selection",
            muted: getSelectableMuted(),
            icon: legacy.selection.selectable(node)
              ? ("selectable" as const)
              : ("unselectable" as const),
          };
          function getSelectableMuted() {
            return parents.some(
              (parent) => !legacy.selection.selectable(parent),
            );
          }
          function getVisibleMuted() {
            return parents.some((p) => "visible" in p && !p.visible);
          }
          return {
            children: [
              {
                component: "ToggleButton",
                props: selectableProps,
                events: {
                  onclick() {
                    if (legacy.selection.selectable(node)) {
                      legacy.selection.disable(node);
                    } else {
                      legacy.selection.enable(node);
                    }
                    return 2;
                  },
                },
                sync(patch) {
                  selectableProps.icon = legacy.selection.selectable(node)
                    ? "selectable"
                    : "unselectable";
                  selectableProps.muted = getSelectableMuted();
                  patch.props = selectableProps;
                },
              },
              ifController(
                () => ("visible" in node ? node : false),
                (ref) => {
                  const props = {
                    icon: ref.value.visible
                      ? ("eye-opened" as const)
                      : ("eye-closed" as const),
                    transparent: true,
                    muted: getVisibleMuted(),
                    hint: "",
                  };
                  return {
                    component: "ToggleButton",
                    props,
                    events: {
                      onclick() {
                        ref.value.visible = !ref.value.visible;
                        return 3;
                      },
                    },
                    sync(patch: any) {
                      props.icon = ref.value.visible
                        ? "eye-opened"
                        : "eye-closed";
                      props.hint = ref.value.visible ? "Hide (h)" : "Show (h)";
                      props.muted = getVisibleMuted();
                      patch.props = props;
                    },
                  };
                },
              ),
            ],
          };
        },
      });
    },
    {
      component: "Warning",
      props: { icon: "warning", message: "No scene detected." },
    },
  );
}
