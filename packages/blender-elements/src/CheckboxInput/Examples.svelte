<script lang="ts">
  import CheckboxInput from "./CheckboxInput.svelte";

  let value = $state(false);
  let toggle = $state(true);
</script>

<CheckboxInput bind:value>Via bind:value {value}</CheckboxInput>

<CheckboxInput
  label="via setValue props: {toggle}"
  value={toggle}
  setValue={(checked) => {
    toggle = checked;
  }}
/>
