<script lang="ts">
  type Props = { x: number; y: number };
  let { x = $bindable(), y = $bindable() }: Props = $props();
</script>

<gizmo-move {x} {y}></gizmo-move>
