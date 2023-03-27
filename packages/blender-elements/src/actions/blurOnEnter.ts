export default function blurOnEnter(el: HTMLInputElement) {
  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      el.blur();
    }
  }
  el.addEventListener("keydown", onKeydown);
  return {
    destroy() {
      el.removeEventListener("keydown", onKeydown);
    },
  };
}
