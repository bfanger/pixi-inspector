export function hexToRgb(color: string) {
  const rgb = unsafeHexToRgb(color);
  if (rgb === undefined) {
    return [0, 0, 0, undefined] as const;
  }
  return rgb;
}

export function rgbToHex(r: number, g: number, b: number, a?: number): string {
  if (a === undefined) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
}

export function rgbToHsv(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  let h = 0;
  let s;

  const d = max - min;
  if (max === 0) {
    s = 0;
  } else {
    s = d / max;
  }

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, v * 100];
}

export function hsvToRgb(
  h: number,
  s: number,
  v: number,
): [number, number, number] {
  const hue = h / 360;
  const saturation = s / 100;
  const value = v / 100;

  let r = 0;
  let g = 0;
  let b = 0;

  const i = Math.floor(hue * 6);
  const f = hue * 6 - i;
  const p = value * (1 - saturation);
  const q = value * (1 - saturation * f);
  const t = value * (1 - saturation * (1 - f));

  const vInt = i % 6;

  switch (vInt) {
    case 0:
      r = value;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = value;
      b = p;
      break;
    case 2:
      r = p;
      g = value;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = value;
      break;
    case 4:
      r = t;
      g = p;
      b = value;
      break;
    case 5:
      r = value;
      g = p;
      b = q;
      break;
  }

  return [r * 255, g * 255, b * 255];
}

export function hexToHsv(
  hex: string,
): [number, number, number, number | undefined] {
  const [r, g, b, a] = hexToRgb(hex);
  return [...rgbToHsv(r, g, b), a];
}

export function hsvToHex(h: number, s: number, v: number, a?: number): string {
  const [r, g, b] = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b, a);
}

function toHex(channel: number) {
  return Math.round(Math.max(0, Math.min(255, channel)))
    .toString(16)
    .padStart(2, "0");
}

function unsafeHexToRgb(hex: string) {
  let r;
  let g;
  let b;
  let a: number | undefined;

  if (hex.length === 5) {
    r = parseInt(hex.slice(1, 2), 16);
    g = parseInt(hex.slice(2, 3), 16);
    b = parseInt(hex.slice(3, 4), 16);
    a = parseInt(hex.slice(4, 5), 16);
    r = (r << 4) | r;
    g = (g << 4) | g;
    b = (b << 4) | b;
    a = (a << 4) | a;
  } else if (hex.length === 9) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
    a = parseInt(hex.slice(7, 9), 16);
  } else {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }

  if (
    Number.isNaN(r) ||
    Number.isNaN(g) ||
    Number.isNaN(b) ||
    (a !== undefined && Number.isNaN(a))
  ) {
    return undefined;
  }
  return [r, g, b, a] as const;
}
