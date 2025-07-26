<script lang="ts">
  import Fragment from "./Fragment.svelte";
  import type { VDOM } from "./vdom.svelte";
  import VDOMNode from "./VDOMNode.svelte";

  type Props = {
    vdom: VDOM;
  };
  let { vdom }: Props = $props();
</script>

{#if vdom.children === undefined}
  <vdom.Component {...vdom.props} />
{:else if vdom.Component === Fragment}
  {#each vdom.children as child (child)}
    <VDOMNode vdom={child} />
  {/each}
{:else}
  <vdom.Component {...vdom.props}>
    {#each vdom.children as child (child)}
      <VDOMNode vdom={child} />
    {/each}
  </vdom.Component>
{/if}
