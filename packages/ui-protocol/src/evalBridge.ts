import { applyEvent, applyValues, syncTree } from "./tree-fns";
import type {
  Connection,
  TreeControllerNode,
  TreeEvent,
  TreePatchDto,
  TreePatchValueDto,
  TreePath,
} from "./types";

export function evalListen(id: string, tree: TreeControllerNode) {
  const receivers = ((globalThis as any).__UI_PROTOCOL__ =
    (globalThis as any).__UI_PROTOCOL__ ?? {});

  const receiver = {
    set: (values: TreePatchValueDto[]) => {
      return applyValues(tree, values);
    },
    dispatchEvent: (values: TreePatchValueDto[], event: TreeEvent) => {
      return applyEvent(tree, event, applyValues(tree, values));
    },
    sync: (values: TreePatchValueDto[], path: TreePath) => {
      return syncTree(tree, path, applyValues(tree, values));
    },
  };

  if (receivers[id]) {
    console.debug(`[devtools] receiver "${id}" was overwritten`); // eslint-disable-line no-console
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
  const target = `window.__UI_PROTOCOL__?.[${JSON.stringify(id)}]`;
  const connected = Promise.withResolvers<void>();
  let timer: ReturnType<typeof setTimeout> | undefined = undefined;

  async function check() {
    const result = await evalFn(`typeof ${target} === "object"`);
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

  async function guardedEval(code: string) {
    const result = await evalFn(
      `typeof ${target} === "object" ? ${code} : '💣'`,
    );
    if (result === "💣") {
      throw new Error("[ui-protocol] Disconnected");
    }
    return result as TreePatchDto;
  }

  return {
    set(values) {
      return guardedEval(`${target}.set(${JSON.stringify(values)})`);
    },
    dispatchEvent: (values, event) => {
      return guardedEval(
        `${target}.dispatchEvent(${JSON.stringify(values)}, ${JSON.stringify(event)})`,
      );
    },
    sync: (values, path) => {
      return guardedEval(
        `${target}.sync(${JSON.stringify(values)}, ${JSON.stringify(path)})`,
      );
    },
  };
}
