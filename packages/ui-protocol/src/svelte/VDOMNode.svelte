<script lang="ts" module>
  export { snippet };
</script>

<script lang="ts">
  import type { VDOM } from "./vdom.svelte";

  type Props = {
    vdom: VDOM;
  };
  let { vdom }: Props = $props();
</script>

<vdom.Component {...vdom.props} />

{#snippet snippet(nodes: VDOM[])}
  <!-- eslint-disable-next-line svelte/require-each-key -->
  {#each nodes as node}
    <node.Component {...node.props} />
  {/each}
{/snippet}
