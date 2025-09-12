import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Post } from "./Post";
import { DataContext } from "@/context/RootContext";

// Mock markdown modules
const mockMdModules = {
  "/src/note/program/test.md": () => Promise.resolve("# Test Content\nThis is a test markdown file."),
  "/src/note/study_note/math.md": () => Promise.resolve("# Math Notes\n\n```typescript\nconst x = 5;\n```"),
};

// Mock globals
Object.defineProperty(global, "import", {
  value: {
    meta: {
      glob: jest.fn(() => mockMdModules),
    },
  },
  writable: true,
});

// Mock context
const mockGlobalData = {
  menu: "program",
  themeType: "light",
};


// Mock markdown-to-jsx
jest.mock("markdown-to-jsx", () => {
  return {
    __esModule: true,
    default: ({ children }: { children: string }) => <div>{children}</div>,
  };
});

// Mock antd theme
jest.mock("antd", () => ({
  theme: {
    useToken: () => ({
      token: {
        colorBorder: "#d9d9d9",
        colorPrimaryBg: "#f0f0f0",
      },
    }),
  },
}));

describe("Post", () => {
  const renderPost = (notePath = "program/test.md") => {
    return render(
      <DataContext.Provider value={{ globalData: mockGlobalData, remove: jest.fn(), update: jest.fn(), fetch: jest.fn() }}>
        <Post notePath={notePath} />
      </DataContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state initially", () => {
    renderPost();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("loads and displays markdown content", async () => {
    renderPost();

    await waitFor(() => {
      expect(screen.getByText("Test Content")).toBeInTheDocument();
      expect(screen.getByText("This is a test markdown file.")).toBeInTheDocument();
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("handles different note paths", async () => {
    renderPost("study_note/math.md");

    await waitFor(() => {
      expect(screen.getByText("Math Notes")).toBeInTheDocument();
    });
  });

  it("shows error message when file not found", async () => {
    renderPost("nonexistent/file.md");

    await waitFor(() => {
      expect(screen.getByText(/加载失败/)).toBeInTheDocument();
    });
  });

  it("reloads content when notePath changes", async () => {
    const { rerender } = renderPost("program/test.md");

    await waitFor(() => {
      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    rerender(
      <DataContext.Provider value={{ globalData: mockGlobalData, remove: jest.fn(), update: jest.fn(), fetch: jest.fn() }}>
        <Post notePath="study_note/math.md" />
      </DataContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Math Notes")).toBeInTheDocument();
      expect(screen.queryByText("Test Content")).not.toBeInTheDocument();
    });
  });

  it("applies correct CSS variables for theme", async () => {
    renderPost();

    await waitFor(() => {
      const postElement = screen.getByText("Test Content").closest("div");
      expect(postElement).toHaveStyle({
        "--post-table-border-color": "#d9d9d9",
        "--post-table-th-bg-color": "#f0f0f0",
      });
    });
  });

  it("handles dark theme", async () => {
    const darkGlobalData = { ...mockGlobalData, themeType: "dark" };
    
    render(
      <DataContext.Provider value={{ globalData: darkGlobalData, remove: jest.fn(), update: jest.fn(), fetch: jest.fn() }}>
        <Post notePath="program/test.md" />
      </DataContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });
  });

  it("handles empty content gracefully", async () => {
    const emptyMdModules = {
      "/src/note/empty.md": () => Promise.resolve(""),
    };
    
    Object.defineProperty(global, "import", {
      value: {
        meta: {
          glob: jest.fn(() => emptyMdModules),
        },
      },
      writable: true,
    });

    renderPost("empty.md");

    await waitFor(() => {
      expect(screen.queryByText("加载失败")).not.toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });
});