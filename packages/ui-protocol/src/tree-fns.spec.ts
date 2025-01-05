import { describe, it, expect } from "vitest";
import type { TreePatcher, TreeParentNode } from "./types";
import { patchTree } from "./tree-fns";

type TestRef = "root" | number;
const patcher: TreePatcher<TestRef> = {
  createRef(data) {
    return data.p[data.p.length - 1];
  },
};

describe("tree-fns", () => {
  it("patchTree()", () => {
    const tree: TreeParentNode<TestRef> = { ref: "root", nested: [] };
    patchTree(
      tree,
      {
        appends: [{ p: [0], c: "TextInput", a: {}, d: "Hello world" }],
      },
      patcher,
    );
    expect(tree).toEqual({
      ref: "root",
      nested: [
        {
          ref: 0,
          component: "TextInput",
          attributes: {},
          data: "Hello world",
          nested: [],
        },
      ],
    });

    patchTree(
      tree,
      {
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
      },
      patcher,
    );
    expect(tree).toEqual({
      ref: "root",
      nested: [
        {
          ref: 0,
          component: "NumberInput",
          attributes: {},
          data: 0,
          nested: [],
        },
        {
          ref: 1,
          component: "SplitPanel",
          attributes: {},
          data: null,
          nested: [
            {
              ref: 0,
              component: "TextInput",
              attributes: {},
              data: "Panel 1",
              nested: [],
            },
            {
              ref: 1,
              component: "TextInput",
              attributes: {},
              data: "Panel 2",
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
        truncates: [{ p: [], l: 1 }],
      },
      patcher,
    );
    expect(tree).toEqual({
      ref: "root",
      nested: [
        {
          ref: 0,
          component: "NumberInput",
          attributes: { step: 10 },
          data: 50,
          nested: [],
        },
      ],
    });
  });
});
