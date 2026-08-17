<script lang="ts">
  import type { Snippet } from "svelte";
  import type { CSSEdges } from "../cssBox";
  import cssEdges from "../cssBox";
  import px from "../px";

  type Props = {
    gap?: string | number;
    align?: CSSStyleDeclaration["alignItems"];
    margin?: CSSEdges;
    children: Snippet;
  };
  let { align, gap, margin, children }: Props = $props();
</script>

<div
  class="toolbar"
  style:justify-content={align}
  style:gap={px(gap)}
  style:margin={cssEdges(margin)}
>
  {@render children()}
</div>

<style>
  .toolbar {
    display: flex;
    padding: 2px 8px;
    background: #282828;
  }
</style>
