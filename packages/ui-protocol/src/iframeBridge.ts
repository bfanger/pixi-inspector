import { applyData, applyEvent, syncTree } from "./tree-fns";
import type {
  Connection,
  TreeControllerNode,
  TreeEvent,
  TreePatchDataDto,
  TreePatchDto,
  TreePath,
} from "./types";

const handlerPool = 256;
const connectInterval = 1_000;
const sendTimeout = 5_000;

export function iframeListen(
  tree: TreeControllerNode,
  target: Window,
  id: string,
  signal: AbortSignal,
) {
  const type = `ui-protocol\n ${id}`;
  const connectType = `${type}\n connect`;
  const responseType = `${type}\n response`;

  function listener(e: MessageEvent) {
    if (e.data?.type === connectType) {
      if (!e.source) {
        throw new Error("Can't respond to the connection, no source");
      }
      e.source.postMessage({ type: responseType, connect: true });
    } else if (e.data?.type === type) {
      let patch: TreePatchDto | undefined;
      applyData(tree, e.data.data);
      if (e.data.event) {
        patch = applyEvent(tree, e.data.event);
      } else if (e.data.sync) {
        patch = syncTree(tree, e.data.sync);
      }
      if (patch) {
        if (!e.source) {
          throw new Error("Can't respond to the message, no source");
        }
        e.source.postMessage({ type: responseType, ref: e.data.ref, patch });
      }
    }
  }
  target.addEventListener("message", listener, { signal });
}

export async function iframeConnect(
  target: Window,
  id: string,
  signal: AbortSignal,
): Promise<Connection> {
  const type = `ui-protocol\n ${id}`;
  const connectType = `${type}\n connect`;
  const responseType = `${type}\n response`;
  const handlers: Record<number, (path: TreePatchDto) => void> = {};
  const connected = Promise.withResolvers<void>();

  let ref = 0;

  function listener(e: MessageEvent) {
    if (e.data?.type === responseType) {
      if (e.data.connect) {
        connected.resolve();
      } else {
        handlers[e.data.ref]?.(e.data.patch);
      }
    }
  }
  window.addEventListener("message", listener, { signal });

  const interval = setInterval(() => {
    target.postMessage({ type: connectType });
  }, connectInterval);
  target.postMessage({ type: connectType });
  signal.addEventListener("abort", () => {
    clearInterval(interval);
  });
  await connected.promise;
  clearInterval(interval);

  async function send(message: {
    data: TreePatchDataDto[];
    event?: TreeEvent;
    sync?: TreePath;
  }) {
    signal.throwIfAborted();
    ref = (ref + 1) % handlerPool;
    const { reject, resolve, promise } = Promise.withResolvers<TreePatchDto>();
    handlers[ref] = resolve;
    const timer = setTimeout(() => reject(new Error("timed out")), sendTimeout);
    target.postMessage({ type, ref, ...message });
    promise.then(() => clearTimeout(timer));
    return promise;
  }
  return {
    set(data) {
      target.postMessage({ type, data });
      return Promise.resolve();
    },
    async dispatchEvent(data, event) {
      return await send({ data, event });
    },
    async sync(data, path) {
      return await send({ data, sync: path });
    },
  };
}
