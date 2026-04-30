<script lang="ts">
  import VirtualList from "./VirtualList.svelte";
  import { createRawSnippet, type Snippet } from "svelte";

  type Props = {
    total: number;
    itemSize: number;
    buffer: number;
  };
  let { total, itemSize, buffer }: Props = $props();
  let rest = $state<{
    value: { slot: `slot${number}`; offset: number }[];
    [slot: `slot${number}`]: Snippet;
  }>({
    value: [],
  });

  function render(offset: number, count: number) {
    console.info("render", offset + 1, "-", offset + count);
    const indexes = Array.from({ length: count }, (_, i) => i);

    rest = {
      value: indexes.map((i) => ({ slot: `slot${i}`, offset: i + offset })),
      ...Object.fromEntries(
        indexes.map((i) => [
          `slot${i}`,
          createRawSnippet(() => ({
            render() {
              return `slot ${i + offset + 1}`;
            },
          })),
        ]),
      ),
    };
  }
</script>

<div style="width: 300px; height: 50vh; border: 1px solid gray">
  <VirtualList
    variant="striped"
    {total}
    {itemSize}
    {buffer}
    {render}
    {...rest}
  />
</div>
