export default function px(value: string | number | undefined) {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === "number") {
    return `${value}px`;
  }
  return value;
}
