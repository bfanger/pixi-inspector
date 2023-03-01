export default function selectOnFocus(el: HTMLInputElement) {
  function onFocus() {
    el.select();
  }
  el.addEventListener("focus", onFocus);
  return {
    destroy() {
      el.removeEventListener("focus", onFocus);
    },
  };
}
