import React from "react";
import { ReactRuler, RulerGuide } from "@/note_code/react-ruler";
import { useState } from "react";
import { Slider } from "antd";

function RulerGuideDemo() {
  const [scale, setScale] = useState(100);
  const [guides, setGuides] = useState([
    { id: "1", top: 100, left: 0, direction: "horizontal" as const },
    { id: "2", top: 0, left: 200, direction: "vertical" as const },
  ]);

  const handleGuideDragEnd = (guideId: string, newData: any) => {
    setGuides(guides.map(g =>
      g.id === guideId
        ? { ...g, ...newData }
        : g
    ));
  };

  const handleDeleteGuide = (guideId: string) => {
    setGuides(guides.filter(g => g.id !== guideId));
  };

  // 将像素位置转换为标尺刻度值
  const pixelToRulerValue = (pixel: number) => {
    return Math.round((pixel / scale) * 100);
  };

  // 点击水平标尺添加水平辅助线
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

  // 点击垂直标尺添加垂直辅助线
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
    <div>
      {/* 缩放控制 */}
      <div style={{ marginBottom: "10px", display: "flex", gap: "10px", alignItems: "center", maxWidth: "400px" }}>
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

      <div style={{
        position: "relative",
        width: "100%",
        height: "450px",
        border: "1px solid var(--border-color, #ccc)",
        margin: "20px 0",
        borderRadius: "4px",
        overflow: "hidden"
      }}>
        {/* 水平标尺 - 顶部 */}
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
            end={1000}
            scale={scale}
            height={30}
            startLen={0}
          />
        </div>

        {/* 垂直标尺 - 左侧 */}
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
            end={800}
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
        <div style={{
          position: "absolute",
          top: 30,
          left: 30,
          width: "calc(100% - 30px)",
          height: "calc(100% - 30px)",
          background: "var(--canvas-background, #fafafa)"
        }}>
          {guides.map(guide => {
            // 根据辅助线位置和缩放比例计算显示值
            const currentValue = pixelToRulerValue(guide.direction === "horizontal" ? guide.top : guide.left);

            return (
              <RulerGuide
                key={guide.id}
                id={guide.id}
                direction={guide.direction}
                top={guide.top}
                left={guide.left}
                width={guide.direction === "horizontal" ? 1000 : undefined}
                height={guide.direction === "vertical" ? 800 : undefined}
                move={true}
                value={currentValue}
                guideType="dashed"
                onGetValue={(v) => pixelToRulerValue(v)}
                onGuideDragEnd={(data) => handleGuideDragEnd(guide.id, data)}
                deleteGuide={handleDeleteGuide}
                cursor="move"
              />
            );
          })}
          <div style={{ padding: "20px", paddingTop: "60px" }}>
            <p>🔍 调整缩放滑块改变标尺比例</p>
            <p>📏 点击标尺可添加辅助线</p>
            <p>🖱️ 拖拽辅助线可以移动位置</p>
            <p>❌ 点击 x 按钮可以删除辅助线</p>
            <p>💡 辅助线数值与标尺刻度对应</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RulerGuideDemo;
