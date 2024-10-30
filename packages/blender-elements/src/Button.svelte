<script lang="ts">
  export let value: boolean | undefined = undefined;
  export let location: "ALONE" | "LEFT" | "CENTER" | "RIGHT" = "ALONE";

  function onToggle() {
    if (typeof value === "boolean") {
      value = !value;
    }
  }
</script>

<button
  class="button"
  class:pressed={value}
  data-location={location}
  on:click={onToggle}
  on:click|stopPropagation
  on:dblclick|stopPropagation={() => {}}><slot /></button
>

<style>
  .button {
    appearance: none;
    background: #545454 no-repeat center center;
    color: #e6e6e6;
    border: 1px solid #3d3d3d;
    padding-inline: 8px;
    height: 18px;
    flex-shrink: 0;
    box-shadow: 0 1px 1px rgba(black, 0.6);
    cursor: pointer;

    &[data-location="ALONE"] {
      border-radius: 2px / 3px;
    }
    &[data-location="LEFT"] {
      border-top-left-radius: 2px 3px;
      border-bottom-left-radius: 2px 3px;
      margin-right: 1px;
    }
    &[data-location="CENTER"] {
      margin-right: 1px;
    }
    &[data-location="RIGHT"] {
      border-top-right-radius: 2px 3px;
      border-bottom-right-radius: 2px 3px;
    }

    &:hover {
      background: #656565;
      color: #ffffff;
    }
    &.pressed,
    &:active {
      background-color: #4772b3;
      color: #ffffff;
    }
  }
</style>
