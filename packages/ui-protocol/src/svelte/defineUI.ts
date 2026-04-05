import type { ComponentProps } from "svelte";
import type { TreeEventOptions } from "../types";
import type { UIComponents } from "./components";

function defineUI<T extends UIProtocolInit>(init: T): T;
function defineUI<T extends UIProtocolInit>(
  init: T,
  index: number,
): T & { index: number };

/**
 * Typesafe TreeInit
 */
function defineUI<T extends UIProtocolInit>(
  init: T,
  index?: number,
): T | (T & { index: number }) {
  if (index === undefined) {
    return init;
  }
  return { ...init, index } as T & { index: number };
}

export default defineUI;
export type UIComponentsProps = {
  [K in keyof UIComponents]: ComponentProps<UIComponents[K]>;
};

type ExtractInitProps<T extends Record<string, unknown>> = {
  [K in keyof T as K extends "value"
    ? never
    : T[K] extends ((...args: any[]) => any) | undefined
      ? never
      : K]: T[K];
};

type ExtractInitEvents<T extends Record<string, unknown>> = {
  [K in keyof T as K extends "children" | "setValue"
    ? never
    : T[K] extends ((...args: any[]) => any) | undefined
      ? K
      : never]: T[K] | [T[K], TreeEventOptions];
};

export type InitOf<
  TComponent extends string,
  TProps extends Record<string, unknown>,
> = {
  component: TComponent;
  props?: ExtractInitProps<TProps>;
  events?: ExtractInitEvents<TProps>;
  children?: UIProtocolInit[];
  sync?: (out: UIProtocolInitPatch<TProps>) => void;
} & (TProps extends {
  value?: unknown;
}
  ? { value?: TProps["value"] }
  : unknown) &
  (TProps extends {
    setValue?: unknown;
  }
    ? { setValue?: TProps["setValue"] }
    : unknown);

type InitMapped = {
  [TComponent in keyof UIComponents]: InitOf<
    TComponent,
    UIComponentsProps[TComponent]
  >;
};

export type UIProtocolInitPatch<T extends Record<string, unknown>> = {
  props?: ExtractInitProps<T>;
} & (T extends { value?: unknown } ? { value?: T["value"] } : unknown) &
  (T extends { children?: unknown }
    ? {
        replacements: (UIProtocolInit & { index: number })[];
        appends: UIProtocolInit[];
        truncate?: number;
      }
    : unknown);

export type UIProtocolInit = InitMapped[keyof UIComponents];
