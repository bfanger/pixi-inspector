<script lang="ts">
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import Base from "./Base.svelte";
  import OutlinerRow from "./OutlinerRow.svelte";
</script>

<Meta title="OutlinerRow" component={OutlinerRow} />

<Template let:args>
  <Base>
    <OutlinerRow indent={0} title="Scene Collection" expanded />
    <OutlinerRow indent={1} title="Collection" expanded />
    <OutlinerRow indent={2} title="Camera" />
    <OutlinerRow indent={2} title="Cube" active expanded={false} visible />
    <OutlinerRow indent={2} title="Light" muted visible={false} />
  </Base>
</Template>

<Story name="Default" />
