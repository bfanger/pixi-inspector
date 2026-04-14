import Fragment from "./Fragment.svelte";
import ErrorBoundary from "./ErrorBoundary.svelte";
import Refresh from "./Refresh.svelte";
import Trigger from "./Trigger.svelte";
import NumberInput from "blender-elements/src/NumberInput/NumberInput.svelte";
import Button from "blender-elements/src/Button/Button.svelte";
import CheckboxInput from "blender-elements/src/CheckboxInput/CheckboxInput.svelte";
import Property from "blender-elements/src/Property/Property.svelte";
import Box from "blender-elements/src/Box/Box.svelte";
import Panel from "blender-elements/src/Panel/Panel.svelte";
import TextInput from "blender-elements/src/TextInput/TextInput.svelte";
import SearchInput from "blender-elements/src/SearchInput/SearchInput.svelte";
import Grid from "blender-elements/src/Grid/Grid.svelte";
import SplitPanel from "blender-elements/src/SplitPanel/SplitPanel.svelte";
import SplitPanels from "blender-elements/src/SplitPanel/SplitPanels.svelte";
import Warning from "blender-elements/src/Warning/Warning.svelte";
import Tabs from "blender-elements/src/Tabs/Tabs.svelte";
import ColorInput from "blender-elements/src/ColorInput/ColorInput.svelte";
import ToggleButton from "blender-elements/src/ToggleButton/ToggleButton.svelte";
import TreeViewRow from "blender-elements/src/TreeView/TreeViewRow.svelte";
import TreeView from "blender-elements/src/TreeView/TreeView.svelte";

const components = {
  Fragment,
  ErrorBoundary,
  Refresh,
  Trigger,
  Box,
  Grid,
  NumberInput,
  TextInput,
  SearchInput,
  Button,
  ToggleButton,
  CheckboxInput,
  ColorInput,
  Panel,
  SplitPanel,
  SplitPanels,
  Property,
  Warning,
  Tabs,
  TreeView,
  TreeViewRow,
} as const;

type BaseComponents = {
  [K in keyof typeof components]: (typeof components)[K];
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface UIProtocolComponents extends BaseComponents {}
}

export type { UIProtocolComponents };
export default components;
