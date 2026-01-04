<script lang="ts">
  type Props = {
    dragging: boolean;
    color: string;
    rotate: number;
    onmousedown?: (e: MouseEvent) => void;
  };
  let { dragging, color, rotate, onmousedown }: Props = $props();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="arrow"
  class:dragging
  {onmousedown}
  style:color
  style:transform="rotate({rotate}deg);"
>
  <div class="area"></div>
  <div class="dot"></div>
  <div class="line"></div>
  <div class="triangle"></div>
</div>

<style>
  .arrow {
    position: absolute;
    left: 0;
    transform-origin: 0.5px 0.5px;

    width: 100px;
    height: 1px;

    opacity: 0.75;

    &:hover,
    &.dragging {
      opacity: 1;
    }
  }

  :not(.dragging) .area {
    content: "";

    position: absolute;
    top: -13px;
    left: 15px;

    width: 84px;
    height: 27px;
    border-top-right-radius: 13px;
    border-bottom-right-radius: 13px;
  }

  .line {
    content: "";

    position: absolute;
    top: -1px;
    right: 24px;

    width: 61px;
    height: 3px;

    background: linear-gradient(
      to bottom,
      transparent 0%,
      currentcolor 40%,
      currentcolor 60%,
      transparent 100%
    );

    .dragging & {
      width: 72px;
    }
  }

  .triangle {
    content: "";

    position: absolute;
    top: -4px;
    right: 6px;

    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 18px solid currentcolor;
  }

  .dragging .dot {
    content: "";

    position: absolute;
    top: -3px;
    left: -3px;

    width: 7px;
    height: 7px;
    border-radius: 50%;

    background: currentcolor;
  }
</style>
