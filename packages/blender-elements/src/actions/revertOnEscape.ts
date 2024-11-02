/**
 * Usage:
 *
 *   <input bind:value use:revertOnEscape={previousValue} />
 */
export default function revertOnEscape(
  el: HTMLInputElement | HTMLTextAreaElement,
  previous: string,
) {
  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      el.value = previous;
      el.dispatchEvent(new InputEvent("input"));
      e.preventDefault();
      setTimeout(() => {
        el.blur();
      }, 0);
    }
  }
  (el as HTMLElement).addEventListener("keydown", onKeydown);
  return {
    update(value: string) {
      previous = value;
    },
    destroy() {
      (el as HTMLElement).removeEventListener("keydown", onKeydown);
    },
  };
}
