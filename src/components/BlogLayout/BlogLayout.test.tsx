import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BlogLayout } from "./BlogLayout";

// ─── Mock routing ───────────────────────────────────────────────────────────
const mockUseLocation = jest.fn();
const mockUseParams = jest.fn();
jest.mock("react-router-dom", () => ({
  useLocation: () => mockUseLocation(),
  useParams: () => mockUseParams(),
}));

// ─── Mock hooks ──────────────────────────────────────────────────────────────
// jest.mock is hoisted, so we use jest.fn() inside and retrieve the mock later
jest.mock("@/hooks", () => ({
  useClsAddPrefix: (prefix: string) => `${prefix}-test`,
  useIsMobile: jest.fn(() => false),
}));

// Import after mock so we can control return values per test
import * as hooks from "@/hooks";

// ─── Mock context ────────────────────────────────────────────────────────────
jest.mock("@/context", () => ({
  useGlobalData: () => ({
    globalData: { useWeatherBackground: false },
    remove: jest.fn(),
    update: jest.fn(),
    fetch: jest.fn(),
  }),
}));

// ─── Mock constants ──────────────────────────────────────────────────────────
jest.mock("@/utils/constants", () => ({
  ROOT_PATH: "shana.github.io",
}));

// ─── Mock sub-components ─────────────────────────────────────────────────────
jest.mock("@/components", () => ({
  Header: ({ reactNode }: { reactNode?: React.ReactNode }) => (
    <div data-testid="header-component">{reactNode}</div>
  ),
  WeatherBackground: () => <div data-testid="weather-bg" />,
}));

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("BlogLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocation.mockReturnValue({ pathname: "/" });
    mockUseParams.mockReturnValue({ lang: "en" });
    (hooks.useIsMobile as jest.Mock).mockReturnValue(false); // 默认桌面端
  });

  // ── 基础渲染 ──────────────────────────────────────────────────────────────

  it("renders with all sections (desktop)", () => {
    render(
      <BlogLayout
        header={<div data-testid="header">Header Content</div>}
        footer={<div data-testid="footer">Footer Content</div>}
        sider={<div data-testid="sider">Sider Content</div>}
        content={<div data-testid="content">Main Content</div>}
      />
    );

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("sider")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("renders without optional sections", () => {
    render(<BlogLayout />);
    expect(screen.getByTestId("header-component")).toBeInTheDocument();
  });

  // ── 桌面端行为 ──────────────────────────────────────────────────────────────

  it("[桌面端] 有 sider 时渲染 Sider，无汉堡按钮", () => {
    (hooks.useIsMobile as jest.Mock).mockReturnValue(false);

    render(
      <BlogLayout sider={<div data-testid="sider-content">目录</div>} />
    );

    expect(screen.getByTestId("sider-content")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "打开侧边栏" })).not.toBeInTheDocument();
  });

  it("[桌面端] 无 sider prop 时不渲染侧边栏控件", () => {
    (hooks.useIsMobile as jest.Mock).mockReturnValue(false);

    render(<BlogLayout content={<div>内容</div>} />);

    expect(screen.queryByRole("button", { name: "打开侧边栏" })).not.toBeInTheDocument();
  });

  // ── 移动端行为 ──────────────────────────────────────────────────────────────

  it("[移动端] 有 sider 时显示汉堡按钮", () => {
    (hooks.useIsMobile as jest.Mock).mockReturnValue(true);

    render(
      <BlogLayout sider={<div data-testid="sider-content">目录</div>} />
    );

    expect(screen.getByRole("button", { name: "打开侧边栏" })).toBeInTheDocument();
  });

  it("[移动端] 点击汉堡按钮后打开 Drawer", () => {
    (hooks.useIsMobile as jest.Mock).mockReturnValue(true);

    render(
      <BlogLayout sider={<div data-testid="drawer-sider">目录内容</div>} />
    );

    const trigger = screen.getByRole("button", { name: "打开侧边栏" });
    fireEvent.click(trigger);

    expect(screen.getByTestId("drawer-sider")).toBeInTheDocument();
  });

  it("[移动端] 无 sider prop 时不渲染汉堡按钮", () => {
    (hooks.useIsMobile as jest.Mock).mockReturnValue(true);

    render(<BlogLayout content={<div>内容</div>} />);

    expect(screen.queryByRole("button", { name: "打开侧边栏" })).not.toBeInTheDocument();
  });

  it("[移动端] defaultSiderOpen=true 时 Drawer 初始展开", () => {
    (hooks.useIsMobile as jest.Mock).mockReturnValue(true);

    render(
      <BlogLayout
        sider={<div data-testid="open-sider">目录内容</div>}
        defaultSiderOpen={true}
      />
    );

    expect(screen.getByTestId("open-sider")).toBeInTheDocument();
  });
});

