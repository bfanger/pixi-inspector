export function unsafeHexToRgb(hex: string) {
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

export function hexToRgb(color: string) {
  const rgb = unsafeHexToRgb(color);
  if (rgb === undefined) {
    return [0, 0, 0, undefined] as const;
  }
  return rgb;
}

function toHex(channel: number) {
  return Math.round(Math.max(0, Math.min(255, channel)))
    .toString(16)
    .padStart(2, "0");
}

export function rgbToHex(r: number, g: number, b: number, a?: number): string {
  if (a === undefined) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
}

export function rgbToHsl(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

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

  return [h * 360, s * 100, l * 100];
}

export function hslToRgb(
  h: number,
  s: number,
  l: number,
): [number, number, number] {
  const hue = h / 360;
  const saturation = s / 100;
  const lightness = l / 100;

  let r, g, b;

  if (saturation === 0) {
    r = g = b = lightness;
  } else {
    const q =
      lightness < 0.5
        ? lightness * (1 + saturation)
        : lightness + saturation - lightness * saturation;
    const p = 2 * lightness - q;

    r = hue2rgb(p, q, hue + 1 / 3);
    g = hue2rgb(p, q, hue);
    b = hue2rgb(p, q, hue - 1 / 3);
  }

  return [r * 255, g * 255, b * 255];
}

function hue2rgb(p: number, q: number, t: number) {
  if (t < 0) {
    t += 1;
  }
  if (t > 1) {
    t -= 1;
  }
  if (t < 1 / 6) {
    return p + (q - p) * 6 * t;
  }
  if (t <= 1 / 2) {
    return q;
  }
  if (t < 2 / 3) {
    return p + (q - p) * (2 / 3 - t) * 6;
  }
  return p;
}

export function hexToHsl(
  hex: string,
): [number, number, number, number | undefined] {
  const [r, g, b, a] = hexToRgb(hex);
  return [...rgbToHsl(r, g, b), a];
}

export function hslToHex(h: number, s: number, l: number, a?: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b, a);
}
