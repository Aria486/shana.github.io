import React, { useEffect, useRef } from 'react';
import type { NoiseFunction2D } from 'simplex-noise';
import { IWeatherData, AnimationQuality } from './types';
import { sceneConfigs } from './sceneConfigs';
import { createNoiseGenerator } from './utils/noiseUtils';
import { generateWavePoints, drawWavePath, createWaveLayerConfigs } from './utils/waveGenerator';
import './style.scss';

export interface IBeachSceneProps {
  weather: IWeatherData;
  quality: AnimationQuality;
  width?: number;
  height?: number;
  paused?: boolean;
}

interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
}

interface Particle {
  x: number;
  y: number;
  length: number;
  speed: number;
  sway?: number;
  swaySpeed?: number;
}

export const BeachScene: React.FC<IBeachSceneProps> = ({
  weather,
  quality,
  width,
  height,
  paused = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const cloudsRef = useRef<Cloud[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const phaseRef = useRef(0);

  // 新增：噪声生成器和波浪层配置
  const noiseGeneratorsRef = useRef<NoiseFunction2D[]>([]);
  const waveLayerConfigsRef = useRef(createWaveLayerConfigs(quality, weather.condition));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 canvas 尺寸
    const resizeCanvas = () => {
      canvas.width = width || window.innerWidth;
      canvas.height = height || window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const config = sceneConfigs[weather.condition];

    // 初始化云朵
    const initClouds = () => {
      if (!config.showClouds || !config.cloudDensity) return;

      const count = Math.floor(config.cloudDensity * (quality === 'high' ? 1 : quality === 'medium' ? 0.7 : 0.5));
      cloudsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.4,
        width: 80 + Math.random() * 70,
        height: 40 + Math.random() * 30,
        speed: 0.3 + Math.random() * 0.7,
        opacity: 0.6 + Math.random() * 0.3,
      }));
    };

    // 初始化粒子（雨/雪）
    const initParticles = () => {
      if (!config.particleType || !config.particleCount) return;

      const count = config.particleCount[quality];
      particlesRef.current = Array.from({ length: count }, () => {
        const particle: Particle = {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          length: config.particleType === 'rain' ? 12 + Math.random() * 6 : 2 + Math.random() * 2,
          speed: config.particleType === 'rain' ? 8 + Math.random() * 4 : 2 + Math.random() * 2,
        };

        if (config.particleType === 'snow') {
          particle.sway = Math.random() * Math.PI * 2;
          particle.swaySpeed = 0.02 + Math.random() * 0.03;
        }

        return particle;
      });
    };

    // 新增：初始化波浪噪声生成器
    const initWaveGenerators = () => {
      const configs = createWaveLayerConfigs(quality, weather.condition);
      waveLayerConfigsRef.current = configs;

      // 为每层波浪创建独立的噪声生成器
      noiseGeneratorsRef.current = configs.map((_, index) =>
        createNoiseGenerator(index * 1000) // 使用不同的种子确保每层不同
      );
    };

    initClouds();
    initParticles();
    initWaveGenerators();

    // 渲染天空
    const renderSky = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, config.skyColors.top);
      gradient.addColorStop(1, config.skyColors.bottom);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // 渲染太阳
    const renderSun = () => {
      if (!config.showSun) return;

      const sunX = canvas.width * 0.8;
      const sunY = canvas.height * 0.2;
      const sunRadius = 40;

      // 光晕 (减弱强度)
      for (let i = 3; i >= 1; i--) {
        const gradient = ctx.createRadialGradient(sunX, sunY, sunRadius, sunX, sunY, sunRadius * (1 + i * 0.3));
        gradient.addColorStop(0, `rgba(253, 184, 19, ${0.15 / i})`);
        gradient.addColorStop(1, 'rgba(253, 184, 19, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius * (1 + i * 0.3), 0, Math.PI * 2);
        ctx.fill();
      }

      // 太阳本体
      ctx.fillStyle = '#FDB813';
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fill();
    };

    // 渲染云朵
    const renderClouds = () => {
      cloudsRef.current.forEach((cloud) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;

        // 用多个椭圆组合成云朵形状
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.width * 0.5, cloud.height * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(cloud.x - cloud.width * 0.3, cloud.y, cloud.width * 0.4, cloud.height * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(cloud.x + cloud.width * 0.3, cloud.y, cloud.width * 0.4, cloud.height * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // 更新云朵位置
    const updateClouds = () => {
      cloudsRef.current.forEach((cloud) => {
        cloud.x += cloud.speed;
        if (cloud.x > canvas.width + cloud.width) {
          cloud.x = -cloud.width;
        }
      });
    };

    // 定义横截面视角的关键位置
    const waterLine = canvas.height * 0.25; // 水位线（画面25%处）
    const seaFloor = canvas.height * 0.85;  // 海底线（画面85%处）
    const beachStartX = canvas.width * 0.7; // 沙滩起点（画面右侧30%）

    // 渲染海洋深度背景（垂直渐变：深蓝到浅蓝）
    const renderOceanDepth = () => {
      const gradient = ctx.createLinearGradient(0, waterLine, 0, seaFloor);
      gradient.addColorStop(0, 'rgba(10, 30, 80, 1)');      // 深蓝（深海）
      gradient.addColorStop(0.6, 'rgba(30, 80, 140, 1)');   // 中蓝
      gradient.addColorStop(1, 'rgba(70, 140, 200, 0.9)');  // 浅蓝（浅滩）

      ctx.fillStyle = gradient;
      ctx.fillRect(0, waterLine, canvas.width, seaFloor - waterLine);

      // 添加水平渐变（从左到右变浅，模拟沙滩过渡）
      const horizontalGradient = ctx.createLinearGradient(beachStartX - 100, 0, beachStartX, 0);
      horizontalGradient.addColorStop(0, 'rgba(70, 140, 200, 0)');
      horizontalGradient.addColorStop(1, 'rgba(140, 180, 220, 0.5)');

      ctx.fillStyle = horizontalGradient;
      ctx.fillRect(beachStartX - 100, waterLine, 100, seaFloor - waterLine);
    };

    // 渲染沙滩地形（使用噪声生成轮廓）
    const renderBeach = () => {
      ctx.save();

      // 沙滩基础填充
      const beachGradient = ctx.createLinearGradient(0, seaFloor - 50, 0, canvas.height);
      beachGradient.addColorStop(0, '#E8D4A8'); // 浅沙色
      beachGradient.addColorStop(1, '#D4B896'); // 深沙色

      ctx.fillStyle = beachGradient;
      ctx.fillRect(beachStartX, seaFloor, canvas.width - beachStartX, canvas.height - seaFloor);

      // 添加沙粒纹理
      for (let i = 0; i < 200; i++) {
        const x = beachStartX + Math.random() * (canvas.width - beachStartX);
        const y = seaFloor + Math.random() * (canvas.height - seaFloor);
        const size = Math.random() * 2;
        const opacity = Math.random() * 0.15;

        ctx.fillStyle = `rgba(180, 150, 100, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    // 渲染海洋波浪表面（横截面视角：水平波浪）
    const renderOceanWaves = () => {
      const configs = waveLayerConfigsRef.current;
      const generators = noiseGeneratorsRef.current;

      // 绘制每一层波浪
      configs.forEach((config, index) => {
        if (index >= generators.length) return;

        const noise = generators[index];
        const phase = phaseRef.current * config.speed;

        // 生成水平方向的波浪点
        const points = generateWavePoints(canvas, config, noise, phase, quality, waterLine);

        // 绘制波浪路径
        drawWavePath(ctx, points, config, waterLine, seaFloor);
      });
    };

    // 渲染粒子
    const renderParticles = () => {
      particlesRef.current.forEach((particle) => {
        if (config.particleType === 'rain') {
          ctx.strokeStyle = 'rgba(174, 194, 224, 0.6)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x, particle.y + particle.length);
          ctx.stroke();
        } else if (config.particleType === 'snow') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.length, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    // 更新粒子位置
    const updateParticles = () => {
      particlesRef.current.forEach((particle) => {
        particle.y += particle.speed;

        if (config.particleType === 'snow' && particle.sway !== undefined && particle.swaySpeed !== undefined) {
          particle.x += Math.sin(particle.sway) * 2;
          particle.sway += particle.swaySpeed;
        }

        if (particle.y > canvas.height) {
          particle.y = -10;
          particle.x = Math.random() * canvas.width;
        }
      });
    };

    // 渲染雾气效果
    const renderFog = () => {
      if (config.fogOpacity) {
        ctx.fillStyle = `rgba(255, 255, 255, ${config.fogOpacity * 0.3})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    // 主渲染循环
    let frameCount = 0;
    const animate = () => {
      if (paused) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // 渲染所有层（横截面视角渲染顺序）
      renderSky();
      // renderOceanDepth();      // 海洋深度背景
      // renderBeach();           // 沙滩地形
      // renderOceanWaves();      // 海洋表面波浪
      renderSun();
      renderClouds();
      renderParticles();
      renderFog();

      // 更新动画状态（降低相位增量，使波浪运动更缓慢自然）
      phaseRef.current += 0.01;
      frameCount++;

      // 云朵每 3 帧更新一次（性能优化）
      if (frameCount % 3 === 0) {
        updateClouds();
      }

      updateParticles();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [weather, quality, width, height, paused]);

  return <canvas ref={canvasRef} className="beach-scene-canvas" />;
};
