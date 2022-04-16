import { getContext, setContext } from "svelte";
import { Bridge } from "./types";

export function setBridgeContext(bridge: Bridge) {
  setContext("bridge", bridge);
}

export function getBridgeContext(): Bridge {
  const ctx = getContext<Bridge>("bridge");
  if (!ctx) {
    throw new Error("Bridge context not found");
  }
  return ctx;
}
