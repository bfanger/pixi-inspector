<script lang="ts">
  import Checkbox from "./Checkbox.svelte";

  let value = $state(false);
  let toggle = $state(true);
</script>

<Checkbox bind:value>Via bind:value {value}</Checkbox>

<Checkbox
  label="via setValue props: {toggle}"
  value={toggle}
  setValue={(checked) => {
    toggle = checked;
  }}
/>
