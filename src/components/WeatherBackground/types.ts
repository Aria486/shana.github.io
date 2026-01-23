export type WeatherCondition =
  | "Clear"
  | "Clouds"
  | "Rain"
  | "Thunderstorm"
  | "Snow"
  | "Mist";

export interface IWeatherData {
  location: string;
  temperature: number;
  condition: WeatherCondition;
  conditionCode: number;
  description: string;
  timestamp: number;
}

export type AnimationQuality = "high" | "medium" | "low";

export interface SceneConfig {
  skyColors: { top: string; bottom: string };
  waveAmplitude: number;
  waveFrequency: number;
  showSun: boolean;
  showClouds: boolean;
  cloudDensity?: number;
  particleType?: "rain" | "snow" | null;
  particleCount?: { high: number; medium: number; low: number };
  showLightning?: boolean;
  lightningInterval?: [number, number];
  fogOpacity?: number;
}

// 新增：波浪相关类型定义
export interface Point {
  x: number;
  y: number;
}

export interface WaveLayerConfig {
  color: string;
  opacity: number;
  amplitude: number;
  frequency: number;
  speed: number;
  basePosition: number; // 距左侧的基准距离（百分比，如 0.05 表示 5%）
}
