/**
 * 波浪生成器
 * 使用 Simplex 噪声生成自然流畅的横截面波浪曲线（水平方向）
 */

import type { NoiseFunction2D } from "simplex-noise";
import type { Point, WaveLayerConfig, AnimationQuality } from "../types";
import { getNoiseValue } from "./noiseUtils";

/**
 * 生成水平方向的波浪点序列（横截面视角）
 * @param canvas Canvas 元素
 * @param config 波浪层配置
 * @param noise 噪声生成器
 * @param phase 当前动画相位（时间偏移）
 * @param quality 渲染质量
 * @param waterLine 水位线 Y 坐标（波浪的基准线）
 * @returns 波浪曲线的点序列
 */
export function generateWavePoints(
  canvas: HTMLCanvasElement,
  config: WaveLayerConfig,
  noise: NoiseFunction2D,
  phase: number,
  quality: AnimationQuality,
  waterLine: number = canvas.height * 0.25,
): Point[] {
  const points: Point[] = [];

  // 根据质量调整采样密度
  const step = quality === "high" ? 3 : quality === "medium" ? 5 : 8;

  // 沿 X 轴方向采样噪声值（水平波浪）
  let xOffset = 0;
  for (let x = 0; x <= canvas.width; x += step) {
    // 使用噪声生成 Y 方向的偏移（波浪高度）
    const noiseValue = getNoiseValue(
      noise,
      xOffset,
      phase, // 时间相位作为第二维坐标
      config.frequency,
    );

    // 计算最终的 Y 坐标（waterLine 为基准，噪声值控制上下波动）
    const y = waterLine + noiseValue * config.amplitude;

    points.push({ x, y });
    xOffset += 0.005; // X 方向的采样步进
  }

  return points;
}

/**
 * 绘制波浪路径（封闭路径，填充海洋颜色）
 * @param ctx Canvas 2D 上下文
 * @param points 波浪曲线点
 * @param config 波浪层配置
 * @param waterLine 水位线
 * @param seaFloor 海底线（或画布底部）
 */
export function drawWavePath(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  config: WaveLayerConfig,
  waterLine: number,
  seaFloor: number,
): void {
  if (points.length === 0) return;

  ctx.save();
  ctx.beginPath();

  // 起点：从第一个波浪点开始
  ctx.moveTo(points[0].x, points[0].y);

  // 绘制波浪曲线（使用二次贝塞尔曲线平滑连接）
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    const prevPoint = points[i - 1];
    const cpX = (point.x + prevPoint.x) / 2;
    const cpY = (point.y + prevPoint.y) / 2;
    ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cpX, cpY);
  }

  // 连接到右下角
  ctx.lineTo(points[points.length - 1].x, seaFloor);

  // 底部线到左下角
  ctx.lineTo(0, seaFloor);

  // 左侧线回到起点，形成封闭路径
  ctx.lineTo(0, points[0].y);
  ctx.closePath();

  ctx.closePath();

  // 填充颜色
  ctx.fillStyle = config.color;
  ctx.globalAlpha = config.opacity;
  ctx.fill();

  ctx.restore();
}

/**
 * 创建波浪层配置
 * @param quality 渲染质量
 * @param weatherCondition 天气条件（可选，用于调整波浪参数）
 * @returns 波浪层配置数组
 */
export function createWaveLayerConfigs(
  quality: AnimationQuality,
  weatherCondition?: string,
): WaveLayerConfig[] {
  // 根据质量决定层数
  const layerCount = quality === "high" ? 4 : quality === "medium" ? 3 : 2;

  // 根据天气条件调整波浪强度
  let amplitudeMultiplier = 1;
  let colorScheme = "default";

  if (weatherCondition) {
    switch (weatherCondition) {
      case "Rain":
        amplitudeMultiplier = 1.5;
        colorScheme = "stormy";
        break;
      case "Thunderstorm":
        amplitudeMultiplier = 2;
        colorScheme = "stormy";
        break;
      case "Snow":
        amplitudeMultiplier = 0.5;
        colorScheme = "calm";
        break;
      case "Mist":
        amplitudeMultiplier = 0.7;
        colorScheme = "muted";
        break;
      case "Clear":
      default:
        amplitudeMultiplier = 1;
        colorScheme = "default";
    }
  }

  // 预定义的波浪层配置（横截面视角：水面波浪）
  const baseConfigs: WaveLayerConfig[] = [
    {
      color: "rgba(200, 220, 240, 0.6)", // 浅蓝色波浪底层
      opacity: 0.6,
      amplitude: 12 * amplitudeMultiplier,
      frequency: 0.01,
      speed: 0.003,
      basePosition: 0, // 不再使用，保留兼容性
    },
    {
      color: "rgba(150, 200, 230, 0.7)", // 中蓝色波浪
      opacity: 0.7,
      amplitude: 15 * amplitudeMultiplier,
      frequency: 0.012,
      speed: 0.0035,
      basePosition: 0,
    },
    {
      color: "rgba(100, 180, 220, 0.8)", // 深蓝色波浪
      opacity: 0.8,
      amplitude: 10 * amplitudeMultiplier,
      frequency: 0.015,
      speed: 0.004,
      basePosition: 0,
    },
    {
      color: "rgba(230, 240, 250, 0.5)", // 白色泡沫层
      opacity: 0.5,
      amplitude: 8 * amplitudeMultiplier,
      frequency: 0.018,
      speed: 0.0045,
      basePosition: 0,
    },
  ];

  // 根据颜色方案调整颜色
  if (colorScheme === "stormy") {
    baseConfigs.forEach((config) => {
      config.color = config.color.replace(
        /rgba\((\d+), (\d+), (\d+)/,
        (_, r, g, b) => {
          const newR = Math.max(0, parseInt(r) - 10);
          const newG = Math.max(0, parseInt(g) - 10);
          const newB = Math.max(0, parseInt(b) - 10);
          return `rgba(${newR}, ${newG}, ${newB}`;
        },
      );
    });
  } else if (colorScheme === "calm") {
    baseConfigs.forEach((config) => {
      config.color = config.color.replace(
        /rgba\((\d+), (\d+), (\d+)/,
        (_, r, g, b) => {
          const newR = Math.min(255, parseInt(r) + 30);
          const newG = Math.min(255, parseInt(g) + 30);
          const newB = Math.min(255, parseInt(b) + 30);
          return `rgba(${newR}, ${newG}, ${newB}`;
        },
      );
    });
  }

  // 返回对应质量的层数
  return baseConfigs.slice(0, layerCount);
}
