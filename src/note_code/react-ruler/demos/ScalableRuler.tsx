import { ReactRuler } from "@/note_code/react-ruler";
import { useState } from "react";
import { Slider } from "antd";

function ScalableRuler() {
  const [scale, setScale] = useState(100);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <span>缩放比例:</span>
        <Slider
          min={50}
          max={200}
          value={scale}
          onChange={setScale}
          style={{ width: "300px" }}
        />
        <span>{scale}%</span>
      </div>
      <ReactRuler
        direction="top"
        start={0}
        end={1000}
        scale={scale}
        height={24}
        startLen={30}
      />
    </div>
  );
}

export default ScalableRuler;
