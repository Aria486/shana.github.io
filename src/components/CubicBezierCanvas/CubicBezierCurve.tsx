import React, { useRef, useEffect } from "react";
import { cubicBezier } from "@/utils/helper";

export const CubicBezierCurve: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    const points = [
      { x: 50, y: height - 50 },
      { x: 100, y: 0 },
      { x: 100, y: 370 },
      { x: 300, y: height - 20 },
    ] as const;
    const [p0, p1, p2, p3] = points;

    // 绘制曲线
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    for (let t = 0; t <= 1; t += 0.01) {
      ctx.lineTo(
        cubicBezier(t, p0.x, p1.x, p2.x, p3.x),
        cubicBezier(t, p0.y, p1.y, p2.y, p3.y)
      );
    }
    ctx.strokeStyle = "blue";
    ctx.stroke();

    // 绘制控制点
    ctx.fillStyle = "red";
    points.forEach(({ x, y }) => {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, []);

  return <canvas ref={canvasRef} width={400} height={400} />;
};
