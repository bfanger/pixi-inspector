export default function revertOnEscape(el: HTMLInputElement) {
  let previous = el.value;
  function onFocus() {
    previous = el.value;
  }
  function onKeydown(e) {
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
  el.addEventListener("focus", onFocus);
  el.addEventListener("keydown", onKeydown);
  return {
    destroy() {
      el.removeEventListener("focus", onFocus);
      el.removeEventListener("keydown", onKeydown);
    },
  };
}
