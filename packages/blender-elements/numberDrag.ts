let pointerLockSupported = true;

type Config = {
  value?: number;
  step?: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  onClick?: (e: MouseEvent) => void;
  onDown?: (e: MouseEvent) => void;
  onUp?: (e: MouseEvent) => void;
};
export default function numberDrag(el: HTMLElement, config: Config) {
  let started:
    | {
        moved: number;
        value: number;
        ts: number;
      }
    | undefined;

  function onMousedown(e: MouseEvent) {
    if (!config.step) {
      return;
    }
    config.onDown?.(e);
    if (typeof config.value === "number") {
      started = {
        moved: 0,
        value: config.value,
        ts: Date.now(),
      };
      document.addEventListener("mousemove", onMousemove);
      requestPointerLock(el);
    }
  }

  function onMouseup(e: MouseEvent) {
    config.onUp?.(e);
    if (!started) {
      return;
    }
    document.removeEventListener("mousemove", onMousemove);
    if (pointerLockSupported) {
      document.exitPointerLock();
    }
    if (started.moved === 0) {
      config?.onClick?.(e);
    }
    started = undefined;
  }

  function onMousemove(e: MouseEvent) {
    if (!started || !config.step) {
      return;
    }
    if (started.moved === 0) {
      // The first mousemove event Firefox has misbehaving movementX values, bug 1417702
      started.moved = Math.min(1, Math.max(e.movementX, -1));
    } else {
      started.moved += e.movementX;
    }

    const mouseStep = e.shiftKey ? config.step / 20 : config.step / 2;
    const offset = started.moved * mouseStep;
    let value = started.value + offset;
    if (e.ctrlKey) {
      const rest = value % (config.step * (e.shiftKey ? 1 : 10));
      value -= rest;
    }

    if (typeof config.min === "number" && value < config.min) {
      value = config.min;
    }
    if (typeof config.max === "number" && value > config.max) {
      value = config.max;
    }
    config.onChange(value);
  }

  el.addEventListener("mousedown", onMousedown);
  document.addEventListener("mouseup", onMouseup);
  return {
    update(next: Config) {
      // eslint-disable-next-line no-param-reassign
      config = next;
    },
    destroy() {
      el.removeEventListener("mousedown", onMousedown);
      document.removeEventListener("mouseup", onMouseup);
      document.removeEventListener("mousemove", onMousemove);
    },
  };
}

async function requestPointerLock(el: HTMLElement) {
  if (!pointerLockSupported) {
    return;
  }
  try {
    await el.requestPointerLock();
  } catch (err) {
    console.warn(err);
    pointerLockSupported = false;
  }
}
