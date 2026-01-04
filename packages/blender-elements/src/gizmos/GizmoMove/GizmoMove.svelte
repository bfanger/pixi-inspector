<script lang="ts">
  import Arrow from "./GizmoMoveArrow.svelte";

  type Props = { x: number; y: number };
  let { x = $bindable(), y = $bindable() }: Props = $props();

  let axis = $state<"x" | "y">();
  let dragging = $state(false);
  let initial = $state({ x: 0, y: 0 });

  function dragStart(event: MouseEvent, restrict?: "x" | "y") {
    event.preventDefault();
    axis = restrict;
    initial = { x, y };
    dragging = true;

    const startClientX = event.clientX;
    const startClientY = event.clientY;

    function drag(e: MouseEvent) {
      if (restrict === "x") {
        x = initial.x + (e.clientX - startClientX);
      } else if (restrict === "y") {
        y = initial.y + (e.clientY - startClientY);
      } else {
        x = initial.x + (e.clientX - startClientX);
        y = initial.y + (e.clientY - startClientY);
      }
    }

    function dragEnd() {
      window.removeEventListener("mousemove", drag);
      window.removeEventListener("mouseup", dragEnd);
      axis = undefined;
      dragging = false;
    }

    window.addEventListener("mousemove", drag);
    window.addEventListener("mouseup", dragEnd);
  }
</script>

<div class="gizmo-move" style:translate="{x}px {y}px">
  <Arrow
    dragging={dragging && axis === "x"}
    onmousedown={(e) => dragStart(e, "x")}
    color="#ff3752"
    rotate={0}
  />
  <Arrow
    dragging={dragging && axis === "y"}
    onmousedown={(e) => dragStart(e, "y")}
    color="#7fcc1c"
    rotate={-90}
  />
  {#if !dragging || axis === undefined}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="ring" onmousedown={(e) => dragStart(e)}></div>
  {/if}
</div>
{#if dragging}
  <div class="ghost" style:translate="{initial.x}px {initial.y}px">
    {#if axis === "x"}
      <Arrow dragging={true} color="#808080bf" rotate={0} />
    {:else if axis === "y"}
      <Arrow dragging={true} color="#808080bf" rotate={-90} />
    {:else}
      <div class="ring"></div>
    {/if}
  </div>
{/if}

<style>
  .gizmo-move {
    position: absolute;
  }

  .ring {
    position: absolute;
    top: -14px;
    left: -14px;

    box-sizing: border-box;
    width: 29px;
    height: 29px;
    border: 2px solid currentcolor;
    border-radius: 50%;

    color: #fff;

    opacity: 0.75;

    &:hover {
      opacity: 1;
    }

    .ghost & {
      color: #808080bf;
    }
  }

  .ghost {
    pointer-events: none;
    position: absolute;
  }
</style>
