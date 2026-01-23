import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { useClsAddPrefix } from '@/hooks';
import { useGlobalData } from '@/context';
import { BeachScene } from './BeachScene';
import { IWeatherData, AnimationQuality, WeatherCondition } from './types';
import './style.scss';

export interface IWeatherBackgroundProps {
  enabled?: boolean;
  quality?: AnimationQuality;
  opacity?: number;
  className?: string;
}

// 默认天气数据（晴天）
const defaultWeather: IWeatherData = {
  location: 'Default',
  temperature: 20,
  condition: 'Clear',
  conditionCode: 800,
  description: 'Clear sky',
  timestamp: Date.now(),
};

// 检测设备类型
function detectDeviceQuality(): AnimationQuality {
  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
  const isTablet = /iPad|Android.*Tablet/i.test(navigator.userAgent);
  const screenWidth = window.innerWidth;
  const cores = navigator.hardwareConcurrency || 2;

  // 检查用户偏好
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) return 'low';
  if (isMobile) return 'low';
  if (isTablet) return 'medium';
  if (screenWidth < 1024) return 'medium';
  if (cores >= 4) return 'high';

  return 'medium';
}

export const WeatherBackground: React.FC<IWeatherBackgroundProps> = ({
  enabled: userEnabled,
  quality: userQuality,
  opacity = 0.6,
  className,
}) => {
  const prefixCls = useClsAddPrefix('weather-background');
  const { globalData } = useGlobalData();

  // 从 globalData 获取天气状态，默认晴天
  const weatherCondition = (globalData.weatherCondition as WeatherCondition) || 'Clear';

  const [weather, setWeather] = useState<IWeatherData>(defaultWeather);
  const [autoQuality] = useState<AnimationQuality>(detectDeviceQuality());
  const quality = userQuality || autoQuality;

  // 根据 globalData 更新天气状态
  useEffect(() => {
    setWeather({
      ...defaultWeather,
      condition: weatherCondition,
      timestamp: Date.now(),
    });
  }, [weatherCondition]);

  // 检测 prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // 如果系统要求减少动画
  if (reducedMotion) {
    return null;
  }

  return (
    <div
      className={classnames(prefixCls, className)}
      style={{ opacity }}
    >
      <BeachScene weather={weather} quality={quality} />
    </div>
  );
};
