<script lang="ts">
  import NumberField from "./NumberField.svelte";

  let x = $state(123);
  let y = $state(456);
  let z = $state(789);
</script>

<div style="max-width: 200px;">
  <NumberField
    value={x}
    setValue={(val) => {
      x = val;
    }}
    location="top"
  />
  <NumberField bind:value={y} step={1} location="middle" />
  <NumberField bind:value={z} step={1} min={500} max={1000} location="bottom" />
</div>
