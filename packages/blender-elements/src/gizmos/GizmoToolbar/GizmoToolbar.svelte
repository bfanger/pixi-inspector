<script lang="ts">
  import type GizmoToolbarElement from "../gizmo-toolbar";

  type Props = {
    value: string;
    setValue: (value: string) => void;
  };
  let { value = $bindable(), setValue }: Props = $props();
</script>

<gizmo-toolbar
  {value}
  {@attach (el: GizmoToolbarElement) => {
    el.addEventListener("change", () => {
      value = el.value;
      setValue(value);
    });
  }}
></gizmo-toolbar>
