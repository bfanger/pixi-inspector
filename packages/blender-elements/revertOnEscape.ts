export default function revertOnEscape(el: HTMLInputElement, previous: string) {
  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      // eslint-disable-next-line no-param-reassign
      el.value = previous;
      el.dispatchEvent(new InputEvent("input"));
      e.preventDefault();
      setTimeout(() => {
        el.blur();
      }, 0);
    }
  }
  el.addEventListener("keydown", onKeydown);
  return {
    update(value: string) {
      // eslint-disable-next-line no-param-reassign
      previous = value;
    },
    destroy() {
      el.removeEventListener("keydown", onKeydown);
    },
  };
}
