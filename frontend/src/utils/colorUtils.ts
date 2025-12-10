export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const stringToColor = (string: string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

export const mixColors = (color1: string, color2: string, weight: number): string => {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  if (!c1 || !c2) return '#000000';

  const r = Math.round(c1.r * weight + c2.r * (1 - weight));
  const g = Math.round(c1.g * weight + c2.g * (1 - weight));
  const b = Math.round(c1.b * weight + c2.b * (1 - weight));

  return rgbToHex(r, g, b);
};

export const generatePalette = (baseColor: string): Record<number, string> => {
    // Basic logic:
    // 500 is base
    // 50-400 are mixed with white
    // 600-900 are mixed with black/darker color
    
    return {
        50: mixColors('#ffffff', baseColor, 0.95),
        100: mixColors('#ffffff', baseColor, 0.8),
        200: mixColors('#ffffff', baseColor, 0.6),
        300: mixColors('#ffffff', baseColor, 0.4),
        400: mixColors('#ffffff', baseColor, 0.2),
        500: baseColor,
        600: mixColors('#000000', baseColor, 0.1),
        700: mixColors('#000000', baseColor, 0.3),
        800: mixColors('#000000', baseColor, 0.5),
        900: mixColors('#000000', baseColor, 0.7),
    };
};
