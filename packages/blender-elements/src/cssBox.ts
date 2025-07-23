import px from "./px";

export type CSSEdges =
  | {
      top?: string | number;
      right?: string | number;
      bottom?: string | number;
      left?: string | number;
    }
  | string
  | number;
export default function cssEdges(config: CSSEdges | undefined) {
  if (config === undefined) {
    return undefined;
  }
  if (typeof config === "string" || typeof config === "number") {
    return px(config);
  }

  return `${px(config.top) ?? "0"} ${px(config.right) ?? "0"} ${
    px(config.bottom) ?? "0"
  } ${px(config.left) ?? "0"}`;
}
