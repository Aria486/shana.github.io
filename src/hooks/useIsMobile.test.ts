import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "./useIsMobile";

type MediaQueryCallback = (event: MediaQueryListEvent) => void;

function createMatchMedia(matches: boolean) {
  const listeners: MediaQueryCallback[] = [];

  const mql = {
    matches,
    media: "",
    onchange: null,
    addEventListener: (_: string, listener: MediaQueryCallback) => {
      listeners.push(listener);
    },
    removeEventListener: (_: string, listener: MediaQueryCallback) => {
      const idx = listeners.indexOf(listener);
      if (idx !== -1) listeners.splice(idx, 1);
    },
    dispatchEvent: () => false,
    // 触发变化的辅助方法（非标准，仅测试用）
    _trigger: (newMatches: boolean) => {
      listeners.forEach((fn) =>
        fn({ matches: newMatches } as MediaQueryListEvent),
      );
    },
  };

  return mql;
}

describe("useIsMobile", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("移动端视口（≤ 768px）时返回 true", () => {
    const mql = createMatchMedia(true);
    jest
      .spyOn(window, "matchMedia")
      .mockReturnValue(mql as unknown as MediaQueryList);

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("桌面端视口（> 768px）时返回 false", () => {
    const mql = createMatchMedia(false);
    jest
      .spyOn(window, "matchMedia")
      .mockReturnValue(mql as unknown as MediaQueryList);

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("视口从桌面端变为移动端时动态更新", () => {
    const mql = createMatchMedia(false);
    jest
      .spyOn(window, "matchMedia")
      .mockReturnValue(mql as unknown as MediaQueryList);

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      mql._trigger(true);
    });

    expect(result.current).toBe(true);
  });

  it("视口从移动端变为桌面端时动态更新", () => {
    const mql = createMatchMedia(true);
    jest
      .spyOn(window, "matchMedia")
      .mockReturnValue(mql as unknown as MediaQueryList);

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    act(() => {
      mql._trigger(false);
    });

    expect(result.current).toBe(false);
  });

  it("支持自定义断点", () => {
    const mql = createMatchMedia(true);
    const spy = jest
      .spyOn(window, "matchMedia")
      .mockReturnValue(mql as unknown as MediaQueryList);

    renderHook(() => useIsMobile(1024));
    expect(spy).toHaveBeenCalledWith("(max-width: 1024px)");
  });
});
