export default function debounce<T extends (...args: any[]) => void>(
  ms: number,
  fn: T,
): T {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return function debounced(...args: any[]) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, ms);
  } as T;
}
