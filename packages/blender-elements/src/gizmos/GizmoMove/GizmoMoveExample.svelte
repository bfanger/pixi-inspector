<script lang="ts">
  import { fade } from "svelte/transition";
  import type { GizmoMoveData } from "../gizmo-move";
  import type GizmoMoveElement from "../gizmo-move";
  import { type GizmoMoveEvent } from "../gizmo-move";

  let move = $state<GizmoMoveData>();
</script>

{#if move !== undefined}
  <div out:fade={{ delay: 300, duration: 200 }}>
    Distance: {#if move.axis}
      {move[`d${move.axis}`].toFixed(2)}px
    {:else}
      X {move.dx.toFixed(2)}px, Y {move.dy.toFixed(2)}px
    {/if}
  </div>
{/if}

<gizmo-move
  {@attach (el: GizmoMoveElement) => {
    el.x = 200;
    el.y = 200;
  }}
  onmove-start={(e: GizmoMoveEvent) => {
    move = e.detail;
  }}
  onmove-value={(e: GizmoMoveEvent) => {
    move = e.detail;
  }}
  onmove-end={(e: GizmoMoveEvent) => {
    console.info("commit delta move", e.detail);
    move = undefined;
  }}
></gizmo-move>
