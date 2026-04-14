<script lang="ts" module>
  let symbol = Symbol("TreeViewRow");
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import IconButton from "../IconButton.svelte";

  type Props = {
    indent: number;
    label: string;
    expanded?: boolean | undefined;
    setExpanded?: (expanded: boolean) => void;
    active?: boolean;
    onactivate?: () => void;
    ondblclick?: () => void;
    onkeydown?: (event: { key: string }) => void;
    onmouseenter?: () => void;
    onmouseleave?: () => void;
    children?: Snippet;
  };

  let {
    indent,
    label,
    expanded,
    setExpanded,
    active,
    onactivate,
    ondblclick,
    onkeydown,
    children,
    onmouseenter,
    onmouseleave,
  }: Props = $props();

  let el: HTMLDivElement | undefined = $state();

  type PartialProps = {
    indent: number;
    onactivate?: () => void;
  };

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowUp") {
      const sibling: any = el?.previousElementSibling;
      const props: PartialProps = sibling?.[symbol];
      if (props) {
        e.preventDefault();
        sibling.focus();
        props.onactivate?.();
      }
    } else if (e.key === "ArrowDown") {
      const sibling: any = el?.nextElementSibling;
      const props: PartialProps = sibling?.[symbol];
      if (props) {
        e.preventDefault();
        sibling.focus();
        props.onactivate?.();
      }
    } else if (e.key === "ArrowLeft") {
      if (expanded === true) {
        setExpanded?.(false);
        e.preventDefault();
      } else {
        let cursor: any = el;

        while (true) {
          cursor = cursor?.previousElementSibling;
          const props: PartialProps = cursor?.[symbol];
          if (!props) {
            break;
          }
          if (props.indent === indent - 1) {
            e.preventDefault();
            cursor.focus();
            props.onactivate?.();
            break;
          }
        }
      }
    } else if (e.key === "ArrowRight") {
      if (expanded === false) {
        e.preventDefault();
        setExpanded?.(true);
      } else if (expanded === true) {
        const sibling: any = el?.nextElementSibling;
        const props: PartialProps = sibling?.[symbol];
        if (props.indent === indent + 1) {
          e.preventDefault();
          sibling.focus();
          props.onactivate?.();
        }
      }
    } else {
      onkeydown?.({ key: e.key });
    }
  }

  function exposeProps(el: HTMLElement) {
    (el as any as { [symbol]: PartialProps })[symbol] = {
      indent,
      onactivate,
    };
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={el}
  class="treeview-row"
  class:active
  style:--indent={indent}
  tabindex="0"
  onclick={() => onactivate?.()}
  ondblclick={() => ondblclick?.()}
  onmouseenter={() => onmouseenter?.()}
  onmouseleave={() => onmouseleave?.()}
  onkeydown={onKeyDown}
  {@attach exposeProps}
>
  {#if expanded === true}
    <IconButton icon="expanded" onclick={() => setExpanded?.(false)} />
  {:else if expanded === false}
    <IconButton icon="collapsed" onclick={() => setExpanded?.(true)} />
  {:else}
    <div class="toggle-spacer"></div>
  {/if}

  <div class="label">{label}</div>
  {@render children?.()}
</div>

<style>
  .treeview-row {
    display: flex;
    align-items: center;

    height: 20px;
    padding-right: 4px;
    padding-left: calc(var(--indent) * 20px);

    color: #c2c2c2;

    background: #282828;
    outline: none;

    &:nth-child(even) {
      background-color: #2b2b2b;
    }

    &:hover {
      background-color: #444;
    }

    &:focus {
      background-color: #334d80;

      &:hover {
        background-color: #4772b3;
      }
    }

    &.active {
      color: #ffaf29;
    }
  }

  .toggle-spacer {
    width: 20px;
  }

  .label {
    user-select: none;
    overflow: hidden;
    flex: 1;
    text-overflow: ellipsis;
  }
</style>
