import virtualListController from "ui-protocol/src/controllers/virtualListController";

export default function virtualListDemo() {
  return virtualListController({
    buffer: 5,
    itemSize: 20,
    component: "TreeViewRow",
    events: {
      onactivate(...args) {
        console.info("onactivate", ...args);
      },
    },
    getItems(offset, count) {
      return {
        total: 100,
        items: new Array(count).fill(0).map((_, index) => index + offset + 1),
      };
    },
    itemSync(patch, item) {
      patch.props = {
        indent: 1,
        label: `item: ${item}`,
      };
    },
  });
}
