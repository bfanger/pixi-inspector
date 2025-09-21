<script lang="ts">
  import { getBridgeContext } from "./bridge-fns";
  // @ts-ignore
  import uiLegacy from "../build/ui-legacy.txt?raw";

  const bridge = getBridgeContext();
  void bridge(uiLegacy);
</script>

Loading...
