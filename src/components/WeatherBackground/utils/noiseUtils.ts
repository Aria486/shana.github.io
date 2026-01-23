/**
 * 噪声工具函数
 * 封装 Simplex 噪声生成器，用于创建自然的波浪动画
 */

import { createNoise2D, NoiseFunction2D } from "simplex-noise";

/**
 * 创建 2D 噪声生成器
 * @param seed 可选的随机种子，用于生成确定性噪声
 * @returns 2D 噪声函数
 */
export function createNoiseGenerator(seed?: number): NoiseFunction2D {
  // 如果提供了种子，创建一个简单的伪随机数生成器
  const random =
    seed !== undefined
      ? (() => {
          let s = seed;
          return () => {
            s = Math.sin(s) * 10000;
            return s - Math.floor(s);
          };
        })()
      : undefined;

  return createNoise2D(random);
}

/**
 * 获取缩放后的噪声值
 * @param noise 噪声生成函数
 * @param x X 坐标
 * @param y Y 坐标
 * @param scale 缩放因子（值越大，噪声变化越缓慢）
 * @returns 噪声值，范围 [-1, 1]
 */
export function getNoiseValue(
  noise: NoiseFunction2D,
  x: number,
  y: number,
  scale: number = 1,
): number {
  return noise(x * scale, y * scale);
}

/**
 * 将噪声值映射到指定范围
 * @param noiseValue 噪声值 [-1, 1]
 * @param min 目标范围最小值
 * @param max 目标范围最大值
 * @returns 映射后的值
 */
export function mapNoiseToRange(
  noiseValue: number,
  min: number,
  max: number,
): number {
  // 将 [-1, 1] 映射到 [0, 1]
  const normalized = (noiseValue + 1) / 2;
  // 映射到目标范围
  return min + normalized * (max - min);
}
