import type { ComponentProps, Snippet } from "svelte";
import type { TreeControllerNode, TreeEventOptions } from "../types";
import type { UIProtocolComponents } from "./components";

export default function defineUI<T extends UIProtocolInit>(init: T): T {
  return init;
}

type AnyProps = Record<string, unknown>;

type InitProps<T extends AnyProps> = {
  [K in keyof T as K extends "value"
    ? never
    : T[K] extends ((...args: any[]) => any) | undefined
      ? never
      : K]: T[K];
};

type InitEvents<T extends AnyProps> = {
  [K in keyof T as K extends "setValue"
    ? never
    : T[K] extends Snippet
      ? never
      : T[K] extends ((...args: any[]) => any) | undefined
        ? K
        : never]: T[K] | [T[K], TreeEventOptions];
} & {
  setValue?: T extends { setValue?: infer TSetValue }
    ? TSetValue | [TSetValue, TreeEventOptions]
    : never;
};

export type Init<TComponent extends string, TProps extends AnyProps> = {
  component: TComponent;
  props?: InitProps<TProps>;
  events?: InitEvents<TProps>;
  children?: TProps extends { children?: Snippet } ? UIProtocolInit[] : never;
  slots?: Record<string, UIProtocolInit[]>;
  sync?: (this: TreeControllerNode, patch: UIProtocolPatch<TProps>) => void;
  setValue?: TProps extends { setValue?: infer TSetValue } ? TSetValue : never;
} & (TProps extends {
  value?: infer TValue;
}
  ? { value?: TValue; getValue?: () => TValue }
  : unknown);

export type UIProtocolPatch<T extends AnyProps> = {
  props?: InitProps<T>;
  replacements: (UIProtocolInit & { slot?: string; index: number })[];
  appends: (UIProtocolInit & { slot?: string })[];
  truncate: Record<string, number | null>;
} & (T extends { value?: unknown } ? { value?: T["value"] } : unknown);

export type UIProtocolInit = {
  [TComponent in keyof UIProtocolComponents]: Init<
    TComponent,
    ComponentProps<UIProtocolComponents[TComponent]>
  >;
}[keyof UIProtocolComponents];
