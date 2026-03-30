import { useState, useEffect } from "react";

/**
 * 检测当前视口是否为移动端。
 * 默认断点 768px，与 `_breakpoints.scss` 中的 `$breakpoint-mobile` 保持一致。
 *
 * @param breakpoint - 移动端最大宽度阈值（px），默认 768
 * @returns 当视口宽度 ≤ breakpoint 时返回 true
 */
export const useIsMobile = (breakpoint = 768): boolean => {
  const query = `(max-width: ${breakpoint}px)`;

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    // 同步初始值（避免 SSR 与客户端不一致）
    setIsMobile(mediaQuery.matches);

    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  }, [query]);

  return isMobile;
};
