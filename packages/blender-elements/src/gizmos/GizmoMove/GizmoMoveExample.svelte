<script lang="ts">
  import { fade } from "svelte/transition";
  import type { GizmoMoveData } from "../gizmo-move";
  import { type GizmoMoveEvent } from "../gizmo-move";

  let x = $state(200);
  let y = $state(200);
  let move = $state<GizmoMoveData>();
</script>

{#if move !== undefined}
  <div out:fade={{ delay: 300, duration: 200 }}>
    Distance: {#if move.axis}
      {move[move.axis].toFixed(2)}px
    {:else}
      X {move.x.toFixed(2)}px, Y {move.y.toFixed(2)}px
    {/if}
  </div>
{/if}

<gizmo-move
  style="position: absolute; top: {y}px; left: {x}px"
  onmove-start={(e: GizmoMoveEvent) => {
    move = e.detail;
  }}
  onmove-value={(e: GizmoMoveEvent) => {
    move = e.detail;
  }}
  onmove-end={(e: GizmoMoveEvent) => {
    console.info("commit delta move", e.detail);
    x += e.detail.x;
    y += e.detail.y;
    move = undefined;
  }}
></gizmo-move>
