import React, { useRef, useEffect } from "react";
import { cubicBezier } from "utils/helper";

export const CubicBezierCurve: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawBezierCurve = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const p0 = { x: 50, y: height - 50 };
    const p1 = { x: 100, y: 0 };
    const p2 = { x: 100, y: 370 };
    const p3 = { x: 300, y: height - 20 };

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    for (let t = 0; t <= 1; t += 0.01) {
      const x = cubicBezier(t, p0.x, p1.x, p2.x, p3.x);
      const y = cubicBezier(t, p0.y, p1.y, p2.y, p3.y);
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "blue";
    ctx.stroke();

    // 绘制控制点
    [p0, p1, p2, p3].forEach((p) => {
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  useEffect(() => {
    drawBezierCurve();
  }, []);

  return <canvas ref={canvasRef} width={400} height={400} />;
};
