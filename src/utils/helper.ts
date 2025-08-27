export const getRandomRgbColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
};

// 三次贝塞尔曲线
export const cubicBezier = (
  t: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number
): number => {
  const u = 1 - t;
  return (
    u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
  );
};

export const quadraticBezier = (
  t: number,
  p0: number,
  p1: number,
  p2: number
): number => {
  const u = 1 - t;
  return u * u * p0 + 2 * u * t * p1 + t * t * p2;
};

export const linearInterpolation = (
  t: number,
  p0: number,
  p1: number
): number => {
  return p0 + t * (p1 - p0);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
