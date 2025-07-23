<script lang="ts">
  import type { Snippet } from "svelte";
  import type { CSSEdges } from "../cssBox";
  import cssEdges from "../cssBox";
  import px from "../px";

  type Props = {
    gap?: string | number;
    align?: CSSStyleDeclaration["alignItems"];
    margin?: CSSEdges;
    padding?: CSSEdges;
    children: Snippet;
  };
  let { align, gap, margin, padding, children }: Props = $props();
</script>

<div
  class="box"
  style:gap={px(gap)}
  style:align-items={align}
  style:margin={cssEdges(margin)}
  style:padding={cssEdges(padding)}
>
  {@render children()}
</div>

<style>
  .box {
    display: flex;
    flex-direction: column;
  }
</style>
