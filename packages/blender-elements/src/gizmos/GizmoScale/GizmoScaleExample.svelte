<script lang="ts">
  import { fade } from "svelte/transition";
  import type { GizmoScaleData } from "../gizmo-scale";
  import type GizmoScaleElement from "../gizmo-scale";
  import { type GizmoScaleEvent } from "../gizmo-scale";

  let scale = $state<GizmoScaleData>();
</script>

{#if scale !== undefined}
  <div out:fade={{ delay: 300, duration: 200 }}>
    {#if scale.scaleX === scale.scaleY}
      Scale: {scale.scaleX.toFixed(2)}
    {:else if scale.scaleY === 1}
      Scale X: {scale.scaleX.toFixed(2)}
    {:else if scale.scaleX === 1}
      Scale Y: {scale.scaleY.toFixed(2)}
    {:else}
      Scale X: {scale.scaleX.toFixed(2)}, Scale Y: {scale.scaleY.toFixed(2)}
    {/if}
  </div>
{/if}

<gizmo-scale
  {@attach (el: GizmoScaleElement) => {
    el.x = 200;
    el.y = 200;
  }}
  onscale-start={(e: GizmoScaleEvent) => {
    scale = e.detail;
  }}
  onscale-value={(e: GizmoScaleEvent) => {
    scale = e.detail;
  }}
  onscale-end={(e: GizmoScaleEvent) => {
    console.info("commit delta scale", e.detail);
    scale = undefined;
  }}
></gizmo-scale>
