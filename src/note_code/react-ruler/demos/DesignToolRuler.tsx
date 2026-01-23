import React from "react";
import { ReactRuler, RulerGuide } from "@/note_code/react-ruler";
import { useState, useEffect, useRef, useMemo } from "react";
import { Button, Slider } from "antd";

// 画布基准尺寸常量（与标尺 end 值一致）
const CANVAS_BASE_WIDTH = 2000;
const CANVAS_BASE_HEIGHT = 1500;

interface Guide {
  id: string;
  direction: "horizontal" | "vertical";
  rulerValue: number;  // 标尺刻度值（逻辑位置）
  top: number;         // 像素位置（视觉位置）
  left: number;        // 像素位置（视觉位置）
}

type TouchState = {
  initialDistance: number;
  initialScale: number;
} | null;

function DesignToolRuler() {
  const [scale, setScale] = useState(100);
  const [guides, setGuides] = useState<Guide[]>([]);
  const touchStateRef = useRef<TouchState>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const horizontalRulerRef = useRef<HTMLDivElement>(null);
  const verticalRulerRef = useRef<HTMLDivElement>(null);

  // 根据缩放比例计算画布尺寸
  const canvasWidth = useMemo(() => Math.round((CANVAS_BASE_WIDTH * scale) / 100), [scale]);
  const canvasHeight = useMemo(() => Math.round((CANVAS_BASE_HEIGHT * scale) / 100), [scale]);

  // 工具函数：限制数值范围
  const clamp = (value: number, min: number, max: number) => {
    return Math.min(max, Math.max(min, value));
  };

  // 工具函数：计算两个触摸点之间的欧几里得距离
  const getDistance = (t1: React.Touch, t2: React.Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 将标尺刻度值转换为像素位置
  const rulerValueToPixel = (rulerValue: number, currentScale: number) => {
    return Math.round((rulerValue * currentScale) / 100);
  };

  // 将像素位置转换为标尺刻度值
  const pixelToRulerValue = (pixel: number, currentScale: number) => {
    return Math.round((pixel / currentScale) * 100);
  };

  // 处理鼠标滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    // 只有按住 Ctrl/Cmd 键时才触发缩放，避免影响正常页面滚动
    if (!e.ctrlKey && !e.metaKey) {
      return;
    }

    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1; // 向下滚缩小，向上滚放大
    const step = e.shiftKey ? 5 : 10; // Shift 精细缩放
    const newScale = clamp(scale + delta * step, 50, 200);
    setScale(newScale);
  };

  // 处理触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      touchStateRef.current = {
        initialDistance: distance,
        initialScale: scale
      };
    }
  };

  // 处理触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStateRef.current) {
      e.preventDefault();
      const distance = getDistance(e.touches[0], e.touches[1]);
      const ratio = distance / touchStateRef.current.initialDistance;
      const newScale = clamp(
        Math.round(touchStateRef.current.initialScale * ratio),
        50,
        200
      );
      setScale(newScale);
    }
  };

  // 处理触摸结束
  const handleTouchEnd = () => {
    touchStateRef.current = null;
  };

  // scale 变化时同步辅助线位置
  useEffect(() => {
    setGuides(prevGuides =>
      prevGuides.map(guide => ({
        ...guide,
        top: guide.direction === "horizontal"
          ? rulerValueToPixel(guide.rulerValue, scale)
          : guide.top,
        left: guide.direction === "vertical"
          ? rulerValueToPixel(guide.rulerValue, scale)
          : guide.left,
      }))
    );
  }, [scale]);

  // 同步标尺与滚动容器的滚动位置
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollTop } = scrollContainerRef.current;

    // 水平标尺跟随横向滚动
    if (horizontalRulerRef.current) {
      horizontalRulerRef.current.scrollLeft = scrollLeft;
    }

    // 垂直标尺跟随纵向滚动
    if (verticalRulerRef.current) {
      verticalRulerRef.current.scrollTop = scrollTop;
    }
  };

  const addGuide = (direction: "horizontal" | "vertical") => {
    const rulerValue = 100; // 固定刻度值
    const newGuide: Guide = {
      id: Date.now().toString(),
      direction,
      rulerValue,
      top: direction === "horizontal" ? rulerValueToPixel(rulerValue, scale) : 0,
      left: direction === "vertical" ? rulerValueToPixel(rulerValue, scale) : 0,
    };
    setGuides([...guides, newGuide]);
  };

  // 点击水平标尺添加垂直辅助线
  const handleHorizontalRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    // 加上滚动偏移量，得到画布上的实际位置
    const scrollLeft = scrollContainerRef.current?.scrollLeft || 0;
    const actualX = clickX + scrollLeft;
    const rulerValue = pixelToRulerValue(actualX, scale);

    const newGuide: Guide = {
      id: Date.now().toString(),
      direction: "vertical" as const,
      rulerValue,
      top: 0,
      left: actualX,
    };
    setGuides([...guides, newGuide]);
  };

  // 点击垂直标尺添加水平辅助线
  const handleVerticalRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    // 加上滚动偏移量，得到画布上的实际位置
    const scrollTop = scrollContainerRef.current?.scrollTop || 0;
    const actualY = clickY + scrollTop;
    const rulerValue = pixelToRulerValue(actualY, scale);

    const newGuide: Guide = {
      id: Date.now().toString(),
      direction: "horizontal" as const,
      rulerValue,
      top: actualY,
      left: 0,
    };
    setGuides([...guides, newGuide]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        <Button onClick={() => addGuide("horizontal")}>
          添加水平辅助线
        </Button>
        <Button onClick={() => addGuide("vertical")}>
          添加垂直辅助线
        </Button>
        <div style={{ flex: 1, minWidth: "200px", maxWidth: "400px", display: "flex", gap: "10px", alignItems: "center" }}>
          <span>缩放:</span>
          <Slider
            min={50}
            max={200}
            value={scale}
            onChange={setScale}
            style={{ flex: 1 }}
          />
          <span>{scale}%</span>
        </div>
      </div>

      <div style={{ position: "relative", width: "100%", height: "600px", border: "1px solid var(--border-color, #e0e0e0)", borderRadius: "4px", overflow: "hidden" }}>
        {/* 水平标尺 - 顶部横轴 */}
        <div
          ref={horizontalRulerRef}
          style={{
            position: "absolute",
            top: 0,
            left: 30,
            right: 0,
            zIndex: 10,
            background: "var(--background-color, #f5f5f5)",
            cursor: "pointer",
            overflow: "hidden",
          }}
          onClick={handleHorizontalRulerClick}
          title="点击添加垂直辅助线"
        >
          <ReactRuler
            direction="top"
            start={0}
            end={2000}
            scale={scale}
            height={30}
            startLen={0}
          />
        </div>

        {/* 垂直标尺 - 左侧纵轴 */}
        <div
          ref={verticalRulerRef}
          style={{
            position: "absolute",
            top: 30,
            left: 0,
            bottom: 0,
            zIndex: 10,
            background: "var(--background-color, #f5f5f5)",
            cursor: "pointer",
            overflow: "hidden",
          }}
          onClick={handleVerticalRulerClick}
          title="点击添加水平辅助线"
        >
          <ReactRuler
            direction="left"
            start={0}
            end={1500}
            scale={scale}
            height={30}
            startLen={0}
          />
        </div>

        {/* 左上角空白区域 */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 30,
          height: 30,
          background: "var(--background-color, #f5f5f5)",
          border: "1px solid var(--border-color, #e0e0e0)",
          zIndex: 11
        }} />

        {/* 滚动容器：提供滚动功能，固定视口尺寸 */}
        <div
          ref={scrollContainerRef}
          style={{
            position: "absolute",
            top: 30,
            left: 30,
            width: "calc(100% - 30px)",
            height: "calc(100% - 30px)",
            overflow: "auto",
          }}
          onScroll={handleScroll}
        >
          {/* 画布：动态尺寸根据缩放变化，包含所有内容 */}
          <div
            style={{
              width: canvasWidth,
              height: canvasHeight,
              position: "relative",
              background: "var(--canvas-background, #fafafa)",
              touchAction: "none",
            }}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {guides.map(guide => (
              <RulerGuide
                key={guide.id}
                {...guide}
                move={true}
                width={guide.direction === "horizontal" ? "100%" : undefined}
                height={guide.direction === "vertical" ? "100%" : undefined}
                value={guide.rulerValue}
                guideType="dashed"
                onGetValue={(v) => v}
                onGuideDragEnd={(data) => {
                  const pixelValue = guide.direction === "horizontal"
                    ? (data.top ?? guide.top)
                    : (data.left ?? guide.left);
                  const newRulerValue = pixelToRulerValue(pixelValue, scale);
                  setGuides(guides.map(g =>
                    g.id === guide.id ? { ...g, ...data, rulerValue: newRulerValue } : g
                  ));
                }}
                deleteGuide={(id) => {
                  setGuides(guides.filter(g => g.id !== id));
                }}
                cursor="move"
              />
            ))}
            {guides.length === 0 && (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "var(--text-secondary, #999)"
              }}>
                点击标尺或上方按钮添加辅助线
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesignToolRuler;
