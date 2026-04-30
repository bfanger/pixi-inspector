import virtualListController from "ui-protocol/src/controllers/virtualListController";

export default function virtualListDemo() {
  return virtualListController({
    buffer: 0,
    itemSize: 20,
    variant: "striped",

    getKeys(offset, count) {
      return {
        total: 100,
        keys: new Array(count).fill(0).map((_, index) => index + offset + 1),
      };
    },
    render(item) {
      return {
        component: "TreeViewRow",
        props: {
          indent: 1,
          label: `Item ${item}`,
        },
        events: {
          onactivate() {
            console.info("onactivate", item);
          },
        },
      };
    },
  });
}
