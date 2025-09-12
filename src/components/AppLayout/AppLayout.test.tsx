import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppLayout } from "./AppLayout";

// Mock child component
const MockChildComponent = ({ globalSearchKeyword = "", sortType = "time" }) => (
  <div data-testid="child-component">
    <div>Search Keyword: {globalSearchKeyword}</div>
    <div>Sort Type: {sortType}</div>
  </div>
);

// Mock components
jest.mock("@/components", () => ({
  BlogLayout: ({ children, content, header, sortType, onSortChange }: any) => (
    <div>
      <div data-testid="blog-layout-header">{header}</div>
      <div data-testid="blog-layout-content">
        {content || children}
      </div>
      <select 
        data-testid="sort-select" 
        value={sortType} 
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="time">Time</option>
        <option value="name">Name</option>
      </select>
    </div>
  ),
  GlobalSearch: ({ onSearch }: { onSearch: (keyword: string) => void }) => (
    <input
      data-testid="search-input"
      type="text"
      onChange={(e) => onSearch(e.target.value)}
      placeholder="Search..."
    />
  ),
  ThemeSwitch: () => <div data-testid="theme-switch">Theme Switch</div>,
}));

describe("AppLayout", () => {
  it("renders with default props", () => {
    render(
      <AppLayout>
        <MockChildComponent />
      </AppLayout>
    );

    expect(screen.getByTestId("blog-layout-header")).toBeInTheDocument();
    expect(screen.getByTestId("blog-layout-content")).toBeInTheDocument();
    expect(screen.getByTestId("theme-switch")).toBeInTheDocument();
  });


  it("handles multiple children correctly", () => {
    render(
      <AppLayout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </AppLayout>
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
  });

  it("applies default sort type", () => {
    render(
      <AppLayout>
        <MockChildComponent />
      </AppLayout>
    );

    expect(screen.getByText("Sort Type: time")).toBeInTheDocument();
  });
});