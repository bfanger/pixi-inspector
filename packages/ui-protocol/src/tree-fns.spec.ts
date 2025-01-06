import { describe, it, expect } from "vitest";
import type { TreePatchOptions, TreeNode, TreeDiffMutations } from "./types";
import { createDiff, patchTree } from "./tree-fns";

type TestRef = "root" | number;
const options: TreePatchOptions<TestRef> = {
  createRef(data) {
    return data.p[data.p.length - 1];
  },
};

describe("tree-fns", () => {
  it("patchTree()", () => {
    const tree: TreeNode<TestRef> = {
      component: "App",
      attributes: {},
      data: null,
      path: [],
      ref: "root",
      nested: [],
    };
    patchTree(
      tree,
      {
        updates: [],
        replacements: [],
        truncates: [],
        appends: [{ p: [0], c: "TextInput", a: {}, d: "Hello world" }],
      },
      options,
    );
    expect(tree).toEqual({
      component: "App",
      attributes: {},
      data: null,
      path: [],
      ref: "root",
      nested: [
        {
          component: "TextInput",
          attributes: {},
          data: "Hello world",
          ref: 0,
          path: [0],
          nested: [],
        },
      ],
    });

    patchTree(
      tree,
      {
        updates: [],
        replacements: [{ p: [0], c: "NumberInput", a: {}, d: 0 }],
        appends: [
          {
            p: [1],
            c: "SplitPanel",
            a: {},
            d: null,
            n: [
              { p: [1, 0], c: "TextInput", a: {}, d: "Panel 1" },
              { p: [1, 1], c: "TextInput", a: {}, d: "Panel 2" },
            ],
          },
        ],
        truncates: [],
      },
      options,
    );
    expect(tree).toEqual({
      component: "App",
      attributes: {},
      data: null,
      ref: "root",
      path: [],
      nested: [
        {
          component: "NumberInput",
          attributes: {},
          data: 0,
          path: [0],
          ref: 0,
          nested: [],
        },
        {
          component: "SplitPanel",
          attributes: {},
          data: null,
          path: [1],
          ref: 1,
          nested: [
            {
              component: "TextInput",
              attributes: {},
              data: "Panel 1",
              ref: 0,
              path: [1, 0],
              nested: [],
            },
            {
              component: "TextInput",
              attributes: {},
              data: "Panel 2",
              path: [1, 1],
              ref: 1,
              nested: [],
            },
          ],
        },
      ],
    });

    patchTree(
      tree,
      {
        updates: [{ p: [0], a: { step: 10 }, d: 50 }],
        replacements: [],
        appends: [],
        truncates: [{ p: [], l: 1 }],
      },
      options,
    );
    expect(tree).toEqual({
      component: "App",
      attributes: {},
      data: null,
      path: [],
      ref: "root",
      nested: [
        {
          component: "NumberInput",
          attributes: { step: 10 },
          data: 50,
          ref: 0,
          path: [0],
          nested: [],
        },
      ],
    });
  });
  it("createDiff()", () => {
    let realValue = 1;

    const tree: TreeNode<TestRef> = {
      component: "App",
      attributes: {},
      data: realValue,
      path: [],
      ref: "root",
      nested: [],
    };

    function compare(node: TreeNode<TestRef>, mutations: TreeDiffMutations) {
      if (node.component === "App") {
        if (node.data !== realValue) {
          mutations.update({ data: realValue });
        }
      }
    }
    const emptyDiff = {
      updates: [],
      replacements: [],
      appends: [],
      truncates: [],
    };
    expect(createDiff(tree, compare)).toEqual(emptyDiff);
    realValue = 123;
    const diff = createDiff(tree, compare);
    expect(diff).toEqual({
      updates: [{ p: [], d: 123 }],
      replacements: [],
      appends: [],
      truncates: [],
    });
    patchTree(tree, diff, options);
    expect(createDiff(tree, compare)).toEqual(emptyDiff);
  });
});
