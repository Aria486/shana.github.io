import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NoteList } from "./NoteList";
import { DataContext } from "@/context/RootContext";

// Mock router
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock i18n
const mockT = jest.fn((key) => key);
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockT }),
}));

// Mock global data
const mockGlobalData = {
  menu: "program",
  themeType: "light",
};

const mockAllPaths = {
  program: [
    {
      path: "program/typescript-basic.md",
      name: "TypeScript Basics",
      lastModified: "2024-01-01",
      lastModifiedISO: "2024-01-01T00:00:00.000Z",
    },
    {
      path: "program/react-hooks.md",
      name: "React Hooks Guide",
      lastModified: "2024-01-02",
      lastModifiedISO: "2024-01-02T00:00:00.000Z",
    },
  ],
  study_note: [
    {
      path: "study_note/math-calculus.md",
      name: "Calculus Notes",
      lastModified: "2024-01-03",
      lastModifiedISO: "2024-01-03T00:00:00.000Z",
    },
  ],
};

// Mock route
try {
  jest.mock("@/route", () => ({
    allPaths: mockAllPaths,
  }));
} catch (e) {
  // Ignore if already mocked
}

describe("NoteList", () => {
  const renderNoteList = (props = {}) => {
    return render(
      <DataContext.Provider value={{ globalData: mockGlobalData, remove: jest.fn(), update: jest.fn(), fetch: jest.fn() }}>
        <NoteList {...props} />
      </DataContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks
    mockT.mockImplementation((key) => key);
  });

  it("renders note list with program items", async () => {
    renderNoteList();

    await waitFor(() => {
      expect(screen.getByText("TypeScript Basics")).toBeInTheDocument();
      expect(screen.getByText("React Hooks Guide")).toBeInTheDocument();
    });
  });

  it("filters notes by search keyword", async () => {
    renderNoteList({ globalSearchKeyword: "typescript" });

    await waitFor(() => {
      expect(screen.getByText("TypeScript Basics")).toBeInTheDocument();
      expect(screen.queryByText("React Hooks Guide")).not.toBeInTheDocument();
    });
  });

  it("shows empty state when no results found", async () => {
    renderNoteList({ globalSearchKeyword: "nonexistent" });

    await waitFor(() => {
      expect(screen.getByText("list.searchEmptyText")).toBeInTheDocument();
    });
  });

  it("navigates to note when clicked", async () => {
    const user = userEvent.setup();
    renderNoteList();

    await waitFor(() => {
      expect(screen.getByText("TypeScript Basics")).toBeInTheDocument();
    });

    const noteItem = screen.getByText("TypeScript Basics");
    await user.click(noteItem);

    expect(mockNavigate).toHaveBeenCalledWith("note/program/typescript-basic.md");
  });

  it("displays pagination when many items", async () => {
    const manyItems = Array.from({ length: 10 }, (_, i) => ({
      path: `program/item-${i}.md`,
      name: `Item ${i}`,
      lastModified: `2024-01-${i + 1}`,
      lastModifiedISO: `2024-01-${i + 1}T00:00:00.000Z`,
    }));

    jest.spyOn(mockAllPaths, "program", "get").mockReturnValue(manyItems);

    renderNoteList({ pageSize: 5 });

    await waitFor(() => {
      expect(screen.getByText("Item 0")).toBeInTheDocument();
      expect(screen.getByText("Item 4")).toBeInTheDocument();
      expect(screen.queryByText("Item 5")).not.toBeInTheDocument();
    });

    // Pagination should be visible
    expect(screen.getByRole("button", { name: /1/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /2/ })).toBeInTheDocument();
  });

  it("sorts notes by name", async () => {
    renderNoteList({ sortType: "name" });

    await waitFor(() => {
      const items = screen.getAllByRole("listitem");
      const itemTexts = items.map(item => item.textContent);
      // Should be sorted alphabetically
      expect(itemTexts[0]).toContain("React Hooks Guide");
      expect(itemTexts[1]).toContain("TypeScript Basics");
    });
  });

  it("resets to first page when menu changes", async () => {
    const { rerender } = renderNoteList();

    await waitFor(() => {
      expect(screen.getByText("TypeScript Basics")).toBeInTheDocument();
    });

    // Change menu
    rerender(
      <DataContext.Provider value={{ globalData: { ...mockGlobalData, menu: "study_note" }, remove: jest.fn(), update: jest.fn(), fetch: jest.fn() }}>
        <NoteList />
      </DataContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Calculus Notes")).toBeInTheDocument();
    });
  });
});