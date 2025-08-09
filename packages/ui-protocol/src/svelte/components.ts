import Fragment from "./Fragment.svelte";
import NumberField from "blender-elements/src/NumberField/NumberField.svelte";
import Button from "blender-elements/src/Button/Button.svelte";
import Checkbox from "blender-elements/src/Checkbox/Checkbox.svelte";
import Property from "blender-elements/src/Property/Property.svelte";
import Box from "blender-elements/src/Box/Box.svelte";
import Panel from "blender-elements/src/Panel/Panel.svelte";
import TextField from "blender-elements/src/TextField/TextField.svelte";
import SearchField from "blender-elements/src/SearchField/SearchField.svelte";
import Grid from "blender-elements/src/Grid/Grid.svelte";
import SceneGraphLegacy from "./legacy/SceneGraphLegacy.svelte";
import SplitPanel from "../../../blender-elements/src/SplitPanel/SplitPanel.svelte";
import SplitPanels from "../../../blender-elements/src/SplitPanel/SplitPanels.svelte";
import PropertiesLegacy from "./legacy/PropertiesLegacy.svelte";

const components = {
  Fragment,
  Box,
  Grid,
  NumberField,
  TextField,
  SearchField,
  Button,
  Checkbox,
  Panel,
  SplitPanel,
  SplitPanels,
  Property,
  // Legacy components
  SceneGraphLegacy,
  PropertiesLegacy,
} as const;
export default components;
