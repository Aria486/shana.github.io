import type { CSSProperties, HTMLAttributes } from "react";

export interface RulerGuideProps extends HTMLAttributes<HTMLDivElement> {
  direction?: "vertical" | "horizontal";
  id?: string;
  top?: number;
  left?: number;
  height?: number;
  width?: number;
  right?: number;
  guideColor?: string;
  guideType?: "dashed" | "solid";
  cursor?: CSSProperties["cursor"];
  move?: boolean;
  value?: number;
  onGetValue?: (v: number) => number;
  deleteGuide?: (id: string) => void;
  onGuideDragStart?: () => void;
  onGuideDragEnd?: (v: RulerGuideProps) => void;
}
