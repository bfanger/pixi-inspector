<script lang="ts">
  type Props = { value: number; x?: number; y?: number };
  let { value = $bindable(), x = 0, y = 0 }: Props = $props();
</script>

<div>Rotation: {Math.round(value)}deg</div>

<gizmo-rotate
  {value}
  style="top:{y}px;left:{x}px"
  oninput={(e: InputEvent & { currentTarget: { value: number } }) => {
    value = e.currentTarget.value;
  }}
  onchange={(e: InputEvent & { currentTarget: { value: number } }) => {
    value = e.currentTarget.value;
  }}
></gizmo-rotate>
