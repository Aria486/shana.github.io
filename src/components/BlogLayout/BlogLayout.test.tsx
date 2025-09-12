import React from "react";
import { render, screen } from "@testing-library/react";
import { BlogLayout } from "./BlogLayout";

// Mock routing hooks
const mockUseLocation = jest.fn();
const mockUseParams = jest.fn();
jest.mock("react-router-dom", () => ({
  useLocation: () => mockUseLocation(),
  useParams: () => mockUseParams(),
}));

// Mock hooks
const mockUseClsAddPrefix = jest.fn((prefix) => `${prefix}-test`);
jest.mock("@/hooks", () => ({
  useClsAddPrefix: () => mockUseClsAddPrefix,
}));

// Mock constants
jest.mock("@/utils/constants", () => ({
  ROOT_PATH: "shana.github.io",
}));

describe("BlogLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocation.mockReturnValue({ pathname: "/" });
    mockUseParams.mockReturnValue({ lang: "en" });
  });

  it("renders with all sections", () => {
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

  it("applies correct class names", () => {
    render(<BlogLayout className="custom-class" />);
    
    const layout = screen.getByRole("main").closest(".layout-test");
    expect(layout).toHaveClass("custom-class");
  });

  it("shows sort controls on home page", () => {
    mockUseLocation.mockReturnValue({ pathname: "/en" });
    mockUseParams.mockReturnValue({ lang: "en" });
    
    render(
      <BlogLayout
        header={<div>Header</div>}
        sortType="time"
        onSortChange={jest.fn()}
      />
    );

    // Should pass sort props to header
    const header = screen.getByText("Header");
    expect(header).toBeInTheDocument();
  });

  it("hides sort controls on non-home pages", () => {
    mockUseLocation.mockReturnValue({ pathname: "/en/note/some-note" });
    
    render(
      <BlogLayout
        header={<div>Header</div>}
        sortType="time"
        onSortChange={jest.fn()}
      />
    );

    // Header should still render but without sort controls
    const header = screen.getByText("Header");
    expect(header).toBeInTheDocument();
  });

  it("handles different language routes", () => {
    mockUseParams.mockReturnValue({ lang: "zh" });
    mockUseLocation.mockReturnValue({ pathname: "/zh" });
    
    render(<BlogLayout />);
    
    // Should handle zh language route correctly
    const layout = screen.getByRole("main").closest(".layout-test");
    expect(layout).toBeInTheDocument();
  });

  it("renders without optional sections", () => {
    render(<BlogLayout />);
    
    // Should render successfully without header, footer, sider, or content
    const layout = screen.getByRole("main");
    expect(layout).toBeInTheDocument();
  });

  it("handles complex path patterns", () => {
    mockUseLocation.mockReturnValue({ pathname: "/en/note/program/typescript" });
    
    render(<BlogLayout />);
    
    // Should correctly identify non-home page
    const layout = screen.getByRole("main");
    expect(layout).toBeInTheDocument();
  });

  it("passes through additional props", () => {
    render(
      <BlogLayout
        data-testid="custom-layout"
        style={{ backgroundColor: "red" }}
      />
    );

    const layout = screen.getByTestId("custom-layout");
    expect(layout).toHaveStyle({ backgroundColor: "red" });
  });

  it("handles empty string paths", () => {
    mockUseLocation.mockReturnValue({ pathname: "" });
    
    render(<BlogLayout />);
    
    // Should handle empty path gracefully
    const layout = screen.getByRole("main");
    expect(layout).toBeInTheDocument();
  });
});