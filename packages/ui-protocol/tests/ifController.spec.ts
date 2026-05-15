import { describe, it, expect } from "vitest";
import ifController from "../src/controllers/ifController";
import { applyPatch, applyValues, syncTree } from "../src/tree-fns";
import rootController from "../src/controllers/rootController";
import type { TreeControllerNode } from "../src/types";
import createTestDisplayTree from "./createTestDisplayTree";

describe("ifController", { concurrent: false }, () => {
  let label: string | false = "Hello";
  let controller: TreeControllerNode;
  let truthyController: TreeControllerNode;
  let display: typeof displayRoot;

  const displayRoot = createTestDisplayTree();
  const root = rootController(() => [
    ifController(
      () => label,
      (labelRef) => [
        {
          component: "Property",
          props: { label: labelRef.value },
          sync: (patch) => {
            patch.props = { label: labelRef.value };
          },
        },
        { component: "TextInput", value: "" },
      ],
      () => [
        {
          component: "Warning",
          props: { message: "No label" },
        },
      ],
    ),
  ]);

  function resync() {
    const patch = syncTree(root, [], applyValues(root, []));
    applyPatch(displayRoot, patch);
  }

  it("should start with the truthy children", () => {
    resync();
    controller = root.slots!.children[0];
    truthyController = controller.slots!.children[0];
    display = displayRoot.slots!.children[0];
    expect(controller.slots!.children).toHaveLength(2);
    expect(display.slots!.children.map((c) => c.test)).toMatchInlineSnapshot(`
      [
        {
          "component": "Property",
          "events": undefined,
          "props": {
            "label": "Hello",
          },
          "setValue": undefined,
          "value": undefined,
        },
        {
          "component": "TextInput",
          "events": undefined,
          "props": {},
          "setValue": undefined,
          "value": "",
        },
      ]
    `);
  });

  it("should reuse the children when the condition stays truthy", () => {
    label = "World";
    resync();
    expect(truthyController).toBe(controller.slots!.children[0]);
    expect(display.slots!.children.map((c) => c.test)).toMatchInlineSnapshot(`
      [
        {
          "component": "Property",
          "events": undefined,
          "props": {
            "label": "World",
          },
          "setValue": undefined,
          "value": undefined,
        },
        {
          "component": "TextInput",
          "events": undefined,
          "props": {},
          "setValue": undefined,
          "value": "",
        },
      ]
    `);
  });
  it("should swap all the children when the condition becomes falsy", () => {
    label = false;
    resync();
    expect(controller.slots!.children).toHaveLength(1);
    expect(display.slots!.children.map((c) => c.test)).toMatchInlineSnapshot(`
      [
        {
          "component": "Warning",
          "events": undefined,
          "props": {
            "message": "No label",
          },
          "setValue": undefined,
          "value": undefined,
        },
      ]
    `);
  });
});
