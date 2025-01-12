<script lang="ts">
  import type { VDOM } from "./vdom.svelte";
  import VDOMNode from "./VDOMNode.svelte";

  type Props = {
    vdom: VDOM;
  };
  let { vdom }: Props = $props();
</script>

{#if typeof vdom.children === "undefined"}
  <vdom.Component {...vdom.props} />
{:else}
  <vdom.Component>
    {#each vdom.children as node}
      <VDOMNode vdom={node} {...vdom.props} />
    {/each}
  </vdom.Component>
{/if}
