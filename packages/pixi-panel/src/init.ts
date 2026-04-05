import components from "ui-protocol/src/svelte/components";
import Instructions from "./Instructions.svelte";
import PixiInject from "./PixiInject.svelte";
import SceneGraphLegacy from "./SceneGraphLegacy.svelte";
import ObjectProperties from "./ObjectProperties.svelte";
import SceneProperties from "./SceneProperties.svelte";
import TextProperties from "./TextProperties.svelte";

// Register Pixi components for ui-protocol
Object.assign(components, {
  PixiInstructions: Instructions,
  PixiInject,
  PixiSceneGraph: SceneGraphLegacy,
  PixiObjectProperties: ObjectProperties,
  PixiSceneProperties: SceneProperties,
  PixiTextProperties: TextProperties,
});

declare global {
  interface UIComponents {
    PixiInstructions: typeof Instructions;
    PixiInject: typeof PixiInject;
    PixiSceneGraph: typeof SceneGraphLegacy;
    PixiObjectProperties: typeof ObjectProperties;
    PixiSceneProperties: typeof SceneProperties;
    PixiTextProperties: typeof TextProperties;
  }
}
