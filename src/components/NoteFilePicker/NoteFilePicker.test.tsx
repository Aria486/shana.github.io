import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { NoteFilePicker } from "./NoteFilePicker";
import { DirectoryNode } from "@/interface";

jest.mock("antd", () => ({
  Collapse: ({
    activeKey,
    onChange,
    items,
  }: {
    activeKey: string[];
    onChange: (keys: string[]) => void;
    items: Array<{ key: string; label: React.ReactNode; children: React.ReactNode }>;
  }) => (
    <div data-testid="collapse">
      {items.map((item) => (
        <div key={item.key}>
          <div onClick={() => onChange([...activeKey, item.key])}>{item.label}</div>
          {activeKey.includes(item.key) && <div>{item.children}</div>}
        </div>
      ))}
    </div>
  ),
  Typography: {
    Text: ({ children, ellipsis, title, strong }: { children: React.ReactNode; ellipsis?: boolean; title?: string; strong?: boolean }) => (
      <span title={title}>{children}</span>
    ),
  },
  Empty: ({ description }: { description: string }) => (
    <div data-testid="empty">{description}</div>
  ),
}));

jest.mock("@ant-design/icons", () => ({
  FileTextOutlined: () => <span data-testid="file-icon" />,
  FolderOpenOutlined: () => <span data-testid="folder-icon" />,
  RightOutlined: () => <span data-testid="arrow-icon" />,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockStructure: DirectoryNode[] = [
  {
    name: "program",
    type: "directory",
    children: [
      { name: "react-hooks.md", type: "file", lastModified: "2025-01-01T00:00:00.000Z" },
      { name: "typescript.md", type: "file", lastModified: "2025-01-02T00:00:00.000Z" },
    ],
  },
  {
    name: "game",
    type: "directory",
    children: [
      {
        name: "Blood borne",
        type: "directory",
        children: [
          { name: "Blood borne-1.md", type: "file", lastModified: "2025-01-03T00:00:00.000Z" },
        ],
      },
    ],
  },
];

describe("NoteFilePicker", () => {
  it("空结构时显示空状态提示", () => {
    render(<NoteFilePicker structure={[]} onSelect={jest.fn()} />);
    expect(screen.getByText("editor.picker.empty")).toBeInTheDocument();
  });

  it("渲染所有一级分类", () => {
    render(<NoteFilePicker structure={mockStructure} onSelect={jest.fn()} />);
    expect(screen.getByText("program")).toBeInTheDocument();
    expect(screen.getByText("game")).toBeInTheDocument();
  });

  it("展开分类后显示文件列表", () => {
    render(<NoteFilePicker structure={mockStructure} onSelect={jest.fn()} />);
    fireEvent.click(screen.getByText("program"));
    expect(screen.getByText("react-hooks.md")).toBeInTheDocument();
    expect(screen.getByText("typescript.md")).toBeInTheDocument();
  });

  it("点击文件时调用 onSelect 并传入正确参数", () => {
    const onSelect = jest.fn();
    render(<NoteFilePicker structure={mockStructure} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("program"));
    fireEvent.click(screen.getByText("react-hooks.md"));
    expect(onSelect).toHaveBeenCalledWith(
      "program",
      "react-hooks.md",
      "program/react-hooks.md",
    );
  });

  it("展开子目录后显示子目录内文件", () => {
    const onSelect = jest.fn();
    render(<NoteFilePicker structure={mockStructure} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("game"));
    fireEvent.click(screen.getByText("Blood borne"));
    expect(screen.getByText("Blood borne-1.md")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Blood borne-1.md"));
    expect(onSelect).toHaveBeenCalledWith(
      "game",
      "Blood borne-1.md",
      "game/Blood borne/Blood borne-1.md",
    );
  });

  it("selectedPath 对应的文件项显示选中样式", () => {
    render(
      <NoteFilePicker
        structure={mockStructure}
        selectedPath="program/react-hooks.md"
        onSelect={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByText("program"));
    const fileItem = screen.getByText("react-hooks.md");
    expect(fileItem.closest(".note-file-picker__item")).toHaveClass(
      "note-file-picker__item--selected",
    );
  });
});
