<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import Toggle from "./Toggle.svelte";

  export let indent: number;
  export let title: string;
  export let expanded: boolean | undefined = undefined; // undefined means no arrow
  export let active = false;
  export let visible: boolean | undefined = undefined; // undefined means no arrow:;
  export let muted = false;

  let el: HTMLDivElement;
  const dispatch = createEventDispatcher();
  const external = {
    indent,
    activate() {
      el.focus();
      dispatch("activate");
    },
  };

  $: external.indent = indent;

  onMount(() => {
    (el as any).outlineRow = external;
  });
  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowUp") {
      const controller = (el.previousElementSibling as any)?.outlineRow;
      if (controller) {
        controller.activate();
        e.preventDefault();
      }
    }
    if (e.key === "ArrowDown") {
      const controller = (el.nextElementSibling as any)?.outlineRow;
      if (controller) {
        controller.activate();
        e.preventDefault();
      }
    }
    if (e.key === "ArrowLeft") {
      if (expanded === true) {
        dispatch("collapse");
        e.preventDefault();
      } else {
        let cursor: Element = el;
        // eslint-disable-next-line no-constant-condition
        while (true) {
          cursor = cursor.previousElementSibling;
          const controller = (cursor as any)?.outlineRow;
          if (!controller) {
            break;
          }
          if (controller.indent === indent - 1) {
            controller.activate();
            e.preventDefault();
            break;
          }
        }
      }
    }
    if (e.key === "ArrowRight") {
      if (expanded === false) {
        dispatch("expand");
        e.preventDefault();
      } else if (expanded === true) {
        const controller = (el.nextElementSibling as any)?.outlineRow;
        if (controller.indent === indent + 1) {
          controller.activate();
          e.preventDefault();
        }
      }
    }
    if (e.key === "h") {
      if (visible) {
        dispatch("hide");
      } else {
        dispatch("show");
      }
    }
  }
</script>

<div
  bind:this={el}
  class="outliner-row"
  class:active
  class:muted
  style:--indent={indent}
  on:click={() => dispatch("activate")}
  on:keydown={onKeyDown}
  tabindex="0"
>
  {#if expanded === true}
    <Toggle icon="expanded" on:click={() => dispatch("collapse")} />
  {:else if expanded === false}
    <Toggle icon="collapsed" on:click={() => dispatch("expand")} />
  {:else}
    <span class="toggle-spacer" />
  {/if}
  <span class="title">{title}</span>
  {#if visible === true}
    <Toggle
      icon="eye-opened"
      hint="Hide (h)"
      on:click={() => dispatch("hide")}
    />
  {:else if visible === false}
    <Toggle
      icon="eye-closed"
      hint="Show (h)"
      on:click={() => dispatch("show")}
    />
  {/if}
</div>

<style lang="scss">
  .outliner-row {
    display: flex;
    align-items: center;
    background: #282828;
    color: #c2c2c2;
    height: 20px;
    padding-left: calc(var(--indent) * 20px);
    outline: none;
    padding-right: 4px;
    &:nth-child(even) {
      background-color: #2b2b2b;
    }
    &:focus {
      background-color: #334d80;
    }
    &.active {
      color: #ffaf29;
    }
  }
  .toggle-spacer {
    width: 20px;
  }
  .title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;
    position: default;
    .muted & {
      opacity: 0.5;
    }
  }
</style>
