import Fragment from "./Fragment.svelte";
import NumberField from "../../../blender-elements/src/NumberField/NumberField.svelte";
import Button from "../../../blender-elements/src/Button/Button.svelte";
import Checkbox from "../../../blender-elements/src/Checkbox/Checkbox.svelte";
import Property from "../../../blender-elements/src/Property/Property.svelte";
import PropertyGroups from "../../../blender-elements/src/Property/PropertyGroups.svelte";
import PropertyGroup from "../../../blender-elements/src/Property/PropertyGroup.svelte";
import Panel from "../../../blender-elements/src/Panel/Panel.svelte";
import TextField from "../../../blender-elements/src/TextField/TextField.svelte";
import SearchField from "../../../blender-elements/src/SearchField/SearchField.svelte";

const components = {
  Fragment,
  NumberField,
  TextField,
  SearchField,
  Button,
  Checkbox,
  Panel,
  PropertyGroups,
  PropertyGroup,
  Property,
} as const;
export default components;
