import { applyEvent, applyValues, syncTree } from "./tree-fns";
import type {
  Connection,
  TreeControllerNode,
  TreeEvent,
  TreePatchValueDto,
  TreePath,
} from "./types";

export function evalListen(tree: TreeControllerNode, id: string) {
  const receivers = ((globalThis as any).__UI_PROTOCOL__ =
    (globalThis as any).__UI_PROTOCOL__ ?? {});

  const receiver = {
    set: (values: TreePatchValueDto[]) => {
      applyValues(tree, values);
    },
    dispatchEvent: (values: TreePatchValueDto[], event: TreeEvent) => {
      applyValues(tree, values);
      return applyEvent(tree, event);
    },
    sync: (values: TreePatchValueDto[], path: TreePath) => {
      applyValues(tree, values);
      return syncTree(tree, path);
    },
  };

  if (receivers[id]) {
    console.warn(`receiver "${id}" was overwritten`);
    // @TODO send reset/truncate, before overwriting
  }

  receivers[id] = receiver;
}

export async function evalConnect(
  id: string,
  evalFn: (code: string) => Promise<any>,
  options?: {
    connectInterval?: number;
    signal?: AbortSignal;
  },
): Promise<Connection> {
  const connectInterval = options?.connectInterval ?? 1_000;
  const signal = options?.signal ?? new AbortController().signal;
  const target = `__UI_PROTOCOL__[${JSON.stringify(id)}]`;
  const connected = Promise.withResolvers<void>();
  let timer: ReturnType<typeof setTimeout> | undefined = undefined;

  async function check() {
    const result = await evalFn(
      `typeof window.__UI_PROTOCOL__ === "object" && typeof ${target} === "object"`,
    );
    if (result) {
      connected.resolve();
    } else {
      timer = setTimeout(check, connectInterval);
    }
  }

  await check();
  signal.addEventListener("abort", () => {
    clearTimeout(timer);
  });
  await connected.promise;
  clearTimeout(timer);

  return {
    set(values) {
      return evalFn(`${target}.set(${JSON.stringify(values)})`);
    },
    dispatchEvent: (values, event) => {
      return evalFn(
        `${target}.dispatchEvent(${JSON.stringify(values)}, ${JSON.stringify(event)})`,
      );
    },
    sync: (values, path) => {
      return evalFn(
        `${target}.sync(${JSON.stringify(values)}, ${JSON.stringify(path)})`,
      );
    },
  };
}
