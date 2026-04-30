<script lang="ts">
  import VirtualList from "./VirtualList.svelte";

  type Props = {
    total: number;
    itemSize: number;
    buffer: number;
  };
  let { total, itemSize, buffer }: Props = $props();

  const visible = $state({ offset: 0, count: 10 });

  function render(offset: number, count: number): void {
    console.info("render", offset + 1, "-", offset + count);
    visible.offset = offset;
    visible.count = count;
  }

  function items() {
    return Array.from(
      { length: visible.count },
      (_, i) => visible.offset + i + 1,
    );
  }
</script>

<div style="width: 300px; height: 50vh; border: 1px solid gray">
  <VirtualList
    variant="striped"
    {total}
    {itemSize}
    value={visible.offset}
    {buffer}
    {render}
  >
    {#each items() as id, i (i)}
      <div style:height="{itemSize}px;">
        Item {id}
      </div>
    {/each}
  </VirtualList>
</div>
