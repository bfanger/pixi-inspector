export default function blurOnEnter(el: HTMLElement) {
  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
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
