export interface ReactRulerProps {
  direction?: "top" | "left";
  start?: number;
  end?: number;
  unit?: number;
  scale?: number;
  height?: number;
  startLen?: number;
  /**
   * 标尺线条和文字的颜色
   * @default "rgb(161, 174, 179)"
   */
  strokeStyle?: string;
  /**
   * 标尺刻度文字的字体样式
   * @default "10px Arial"
   */
  font?: string;
}
