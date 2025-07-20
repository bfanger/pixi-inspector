<script lang="ts">
  import Fragment from "./Fragment.svelte";
  import type { VDOM } from "./vdom.svelte";
  import VDOMNode from "./VDOMNode.svelte";

  type Props = {
    vdom: VDOM;
  };
  let { vdom }: Props = $props();
</script>

{#if typeof vdom.children === "undefined"}
  <vdom.Component {...vdom.props} />
{:else if vdom.Component === Fragment}
  {#each vdom.children as node (node)}
    <VDOMNode vdom={node} {...vdom.props} />
  {/each}
{:else}
  <vdom.Component>
    {#each vdom.children as node (node)}
      <VDOMNode vdom={node} {...vdom.props} />
    {/each}
  </vdom.Component>
{/if}
