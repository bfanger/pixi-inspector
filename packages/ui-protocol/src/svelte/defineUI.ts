import type { ComponentProps } from "svelte";
import type { TreeEventOptions } from "../types";
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
  [K in keyof T as K extends "children" | "setValue"
    ? never
    : T[K] extends ((...args: any[]) => any) | undefined
      ? K
      : never]: T[K] | [T[K], TreeEventOptions];
};

export type Init<TComponent extends string, TProps extends AnyProps> = {
  component: TComponent;
  props?: InitProps<TProps>;
  events?: InitEvents<TProps>;
  children?: UIProtocolInit[];
  sync?: (patch: UIProtocolPatch<TProps>) => void;
} & (TProps extends {
  value?: unknown;
}
  ? Pick<TProps, "value">
  : unknown) &
  (TProps extends {
    setValue?: unknown;
  }
    ? Pick<TProps, "setValue">
    : unknown);

export type UIProtocolPatch<T extends AnyProps> = {
  props?: InitProps<T>;
} & (T extends { value?: unknown } ? { value?: T["value"] } : unknown) &
  (T extends { children?: unknown }
    ? {
        replacements: (UIProtocolInit & { index: number })[];
        appends: UIProtocolInit[];
        truncate?: number;
      }
    : unknown);

export type UIProtocolInit = {
  [TComponent in keyof UIProtocolComponents]: Init<
    TComponent,
    ComponentProps<UIProtocolComponents[TComponent]>
  >;
}[keyof UIProtocolComponents];
