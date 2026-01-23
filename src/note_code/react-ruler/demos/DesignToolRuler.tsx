import React from "react";
import { ReactRuler, RulerGuide } from "@/note_code/react-ruler";
import { useState } from "react";
import { Button, Slider } from "antd";

function DesignToolRuler() {
  const [scale, setScale] = useState(100);
  const [guides, setGuides] = useState<any[]>([]);

  const addGuide = (direction: "horizontal" | "vertical") => {
    const newGuide = {
      id: Date.now().toString(),
      direction,
      top: direction === "horizontal" ? 100 : 0,
      left: direction === "vertical" ? 100 : 0,
    };
    setGuides([...guides, newGuide]);
  };

  // 将像素位置转换为标尺刻度值
  const pixelToRulerValue = (pixel: number) => {
    return Math.round((pixel / scale) * 100);
  };

  // 点击水平标尺添加垂直辅助线
  const handleHorizontalRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    const newGuide = {
      id: Date.now().toString(),
      direction: "vertical" as const,
      top: 0,
      left: clickX,
    };
    setGuides([...guides, newGuide]);
  };

  // 点击垂直标尺添加水平辅助线
  const handleVerticalRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;

    const newGuide = {
      id: Date.now().toString(),
      direction: "horizontal" as const,
      top: clickY,
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
          style={{
            position: "absolute",
            top: 0,
            left: 30,
            right: 0,
            zIndex: 10,
            background: "var(--background-color, #f5f5f5)",
            cursor: "pointer"
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
          style={{
            position: "absolute",
            top: 30,
            left: 0,
            bottom: 0,
            zIndex: 10,
            background: "var(--background-color, #f5f5f5)",
            cursor: "pointer"
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

        {/* 工作区域 */}
        <div
          style={{
            position: "absolute",
            top: 30,
            left: 30,
            width: "calc(100% - 30px)",
            height: "calc(100% - 30px)",
            background: "var(--canvas-background, #fafafa)",
          }}
        >
          {guides.map(guide => (
            <RulerGuide
              key={guide.id}
              {...guide}
              move={true}
              width={guide.direction === "horizontal" ? "100%" : undefined}
              height={guide.direction === "vertical" ? "100%" : undefined}
              value={pixelToRulerValue(guide.direction === "horizontal" ? guide.top : guide.left)}
              guideType="dashed"
              onGetValue={(v) => pixelToRulerValue(v)}
              onGuideDragEnd={(data) => {
                setGuides(guides.map(g =>
                  g.id === guide.id ? { ...g, ...data } : g
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
  );
}

export default DesignToolRuler;
