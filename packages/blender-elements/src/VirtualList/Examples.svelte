<script lang="ts">
  import VirtualList from "./VirtualList.svelte";

  type Props = {
    total: number;
    size: number;
    buffer: number;
  };
  let { total, size, buffer }: Props = $props();

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
    {size}
    value={visible.offset}
    {buffer}
    {render}
  >
    {#each items() as id, i (i)}
      <div style:height="{size}px;">
        Item {id}
      </div>
    {/each}
  </VirtualList>
</div>
