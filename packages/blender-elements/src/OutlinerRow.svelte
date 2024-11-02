<script lang="ts">
  import { run, createBubbler } from "svelte/legacy";

  const bubble = createBubbler();
  import { createEventDispatcher, getContext, onMount } from "svelte";
  import Toggle from "./IconButton.svelte";

  type Props = {
    indent: number;
    title: string;
    expanded?: boolean | undefined;
    active?: boolean;
    selectable: boolean;
    parentUnselectable?: boolean | undefined;
    visible?: boolean | undefined;
    match?: boolean | undefined;
    muted?: boolean;
  };

  let {
    indent,
    title,
    expanded = undefined,
    active = false,
    selectable,
    parentUnselectable = undefined,
    visible = undefined,
    match = undefined,
    muted = false,
  }: Props = $props();

  let el: HTMLDivElement | undefined = $state();

  const ctx = getContext<{ focused: boolean }>("scene-graph");

  run(() => {
    if (el && active) {
      if (ctx.focused) {
        el.focus();
      } else {
        el.scrollIntoView();
      }
    }
  });
  const dispatch = createEventDispatcher();
  const external = $state({
    indent,
    activate() {
      dispatch("activate");
    },
  });

  run(() => {
    external.indent = indent;
  });

  onMount(() => {
    (el as any).outlineRow = external;
  });
  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowUp") {
      const controller = (el?.previousElementSibling as any)?.outlineRow;
      if (controller) {
        controller.activate();
        e.preventDefault();
      }
    }
    if (e.key === "ArrowDown") {
      const controller = (el?.nextElementSibling as any)?.outlineRow;
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
        let cursor: Element | null | undefined = el;

        while (true) {
          cursor = cursor?.previousElementSibling;
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
        const controller = (el?.nextElementSibling as any)?.outlineRow;
        if (controller.indent === indent + 1) {
          controller.activate();
          e.preventDefault();
        }
      }
    }

    if (e.key === "h" && visible !== undefined) {
      if (visible) {
        dispatch("hide");
      } else {
        dispatch("show");
      }
    }
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={el}
  class="outliner-row"
  class:active
  class:muted
  class:match
  style:--indent={indent}
  onclick={() => dispatch("activate")}
  ondblclick={() => dispatch("log")}
  onkeydown={onKeyDown}
  onmouseenter={bubble("mouseenter")}
  onmouseleave={bubble("mouseleave")}
  tabindex="0"
>
  {#if expanded === true}
    <Toggle icon="expanded" onclick={() => dispatch("collapse")} />
  {:else if expanded === false}
    <Toggle icon="collapsed" onclick={() => dispatch("expand")} />
  {:else}
    <span class="toggle-spacer"></span>
  {/if}
  <span class="title">{title}</span>
  {#if selectable}
    <Toggle
      icon="selectable"
      hint="Disable right-click selection"
      muted={parentUnselectable}
      onclick={() => dispatch("unselectable")}
    />
  {:else}
    <Toggle
      icon="unselectable"
      hint="Enable right-click selection"
      muted={parentUnselectable}
      onclick={() => dispatch("selectable")}
    />
  {/if}
  {#if visible === true}
    <Toggle
      icon="eye-opened"
      hint="Hide (h)"
      onclick={() => dispatch("hide")}
    />
  {:else if visible === false}
    <Toggle
      icon="eye-closed"
      hint="Show (h)"
      onclick={() => dispatch("show")}
    />
  {/if}
</div>

<style>
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
    &:hover {
      background-color: #444444;
    }
    &:focus {
      background-color: #334d80;
      &:hover {
        background-color: #4772b3;
      }
    }
    &.match {
      background-color: #2f552f;
      &:focus {
        background-color: #336659;
      }
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
  }
  .muted .title {
    opacity: 0.5;
  }
</style>
