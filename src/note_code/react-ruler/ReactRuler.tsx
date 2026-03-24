import React, { useEffect } from "react";
import type { ReactRulerProps } from "./types";
import "./style.scss";

export const ReactRuler: React.FC<ReactRulerProps> = (props) => {
  const {
    direction,
    start = 0,
    end = 1000,
    scale = 100,
    startLen = 30,
    height = 24,
    strokeStyle = "rgb(161, 174, 179)",
    font = "10px Arial"
  } = props;
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const drawRuler = (
    direction: ReactRulerProps["direction"],
    canvas: HTMLCanvasElement,
    scale = 100,
    width: number,
    height = 24,
    startLen = 60,
    strokeStyle = "rgb(161, 174, 179)",
    font = "10px Arial"
  ) => {
    const padding = 2;
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
    const percent = scale * 0.01;
    const unit = 10;
    const rulerStart = start ?? 0;
    // 计算出要绘制多少个刻度
    const scaleCount =
      percent <= 1 ? Math.ceil((width + startLen) / percent / 10) : Math.ceil(((width + startLen) * percent) / 10);
    if (direction == "top") {
      canvas.width = percent <= 1 ? width + startLen : width * percent + startLen;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      // 绘制起点
      ctx.strokeStyle = strokeStyle;
      ctx.font = font;
      ctx.lineWidth = 0.5;
      ctx.moveTo(startLen, 0);
      ctx.lineTo(startLen, height);
      ctx.fillText(`${rulerStart}`, startLen + padding, height);
      for (let i = 1; i <= scaleCount; i++) {
        // 计算每个刻度的位置
        const step = startLen + Math.round(i * unit * percent);
        // 10的倍数刻度大长度
        if (i % 10 === 0) {
          ctx.moveTo(step, 0);
          ctx.lineTo(step, height);
          // 标注刻度值
          const text = unit * i + rulerStart;
          ctx.fillText(`${text}`, step + padding, height);
        } else {
          // 其他刻度小长度
          ctx.moveTo(step, 0);
          ctx.lineTo(step, 4);
        }
      }
      ctx.stroke();
    } else {
      canvas.width = height;
      canvas.height = percent <= 1 ? width + startLen : width * percent + startLen;
      ctx.clearRect(0, 0, height, width + startLen);
      ctx.beginPath();
      // 绘制起点
      ctx.strokeStyle = strokeStyle;
      ctx.font = font;
      ctx.lineWidth = 0.5;
      ctx.moveTo(0, startLen);
      ctx.lineTo(height, startLen);
      ctx.rotate((270 * Math.PI) / 180);
      ctx.fillText(`${rulerStart}`, -(startLen - padding), height);
      ctx.rotate((90 * Math.PI) / 180);
      // 计算出要绘制多少个刻度

      for (let i = 1; i <= scaleCount; i++) {
        const step = startLen + Math.round(i * unit * percent);
        if (i % 10 === 0) {
          ctx.moveTo(0, step);
          ctx.lineTo(height, step);
          // 标注刻度值
          const text = unit * i + rulerStart;
          ctx.rotate((270 * Math.PI) / 180);
          ctx.fillText(`${text}`, -(step - padding), height);
          ctx.rotate((90 * Math.PI) / 180);
        } else {
          ctx.moveTo(0, step);
          ctx.lineTo(4, step);
        }
      }
      ctx.stroke();
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    drawRuler(direction, canvasRef.current, scale, end - start, height, startLen, strokeStyle, font);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, direction, start, end, height, startLen, strokeStyle, font]);

  return <canvas ref={canvasRef} height="40" width="1020" />;
};
