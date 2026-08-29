<script lang="ts">
  import { fade } from "svelte/transition";
  import type GizmoRotateElement from "../gizmo-rotate";
  import type { GizmoRotateEvent } from "../gizmo-rotate";
  let rotation = $state<number>();
  let gizmo: GizmoRotateElement;
</script>

{#if rotation !== undefined}
  <div out:fade={{ delay: 300, duration: 200 }}>
    Rotation: {rotation.toFixed(2)}deg
  </div>
{/if}

<gizmo-rotate
  bind:this={gizmo}
  style="position: absolute; top: 200px; left: 200px"
  onrotate-start={() => {
    rotation = 0;
  }}
  onrotate-value={(e: GizmoRotateEvent) => {
    rotation = e.detail;
  }}
  onrotate-end={(e: GizmoRotateEvent) => {
    console.info("commit delta rotation", e.detail);
    rotation = undefined;
  }}
></gizmo-rotate>
