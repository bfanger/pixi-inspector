type Config = {
  value?: number;
  step?: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  onClick?: () => void;
  onDown?: () => void;
  onUp?: () => void;
};
export default function numberDrag(el: HTMLElement, config: Config) {
  let started:
    | {
        moved: number;
        value: number;
        ts: number;
      }
    | undefined;

  function onMousedown() {
    config.onDown?.();
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

  function onMouseup() {
    config.onUp?.();
    if (!started) {
      return;
    }
    document.removeEventListener("mousemove", onMousemove);
    document.exitPointerLock?.();
    if (started.moved === 0) {
      config?.onClick?.();
    }
    started = undefined;
  }

  function onMousemove(e: MouseEvent) {
    if (!started || !config.step) {
      return;
    }
    started.moved += e.movementX;

    e.preventDefault();
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
  if (!requestPointerLock.supported) {
    return;
  }
  try {
    await el.requestPointerLock();
  } catch (err) {
    console.warn(err);
    requestPointerLock.supported = false;
  }
}
requestPointerLock.supported = true;
