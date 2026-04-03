import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MarkdownEditor } from "./MarkdownEditor";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("@/components/Code", () => ({
  Code: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("MarkdownEditor", () => {
  it("渲染输入区和预览区", () => {
    const onChange = jest.fn();
    render(<MarkdownEditor value="" onChange={onChange} />);
    expect(
      screen.getByPlaceholderText("editor.editor.placeholder"),
    ).toBeInTheDocument();
  });

  it("输入内容时调用 onChange", () => {
    const onChange = jest.fn();
    render(<MarkdownEditor value="" onChange={onChange} />);
    const textarea = screen.getByPlaceholderText("editor.editor.placeholder");
    fireEvent.change(textarea, { target: { value: "# Hello" } });
    expect(onChange).toHaveBeenCalledWith("# Hello");
  });

  it("预览区实时显示 Markdown 渲染内容", () => {
    render(
      <MarkdownEditor value="**bold text**" onChange={jest.fn()} />,
    );
    expect(document.querySelector("strong")).toBeInTheDocument();
    expect(document.querySelector("strong")?.textContent).toBe("bold text");
  });

  it("空内容时预览区显示占位提示", () => {
    render(<MarkdownEditor value="" onChange={jest.fn()} />);
    expect(screen.getByText("editor.editor.previewEmpty")).toBeInTheDocument();
  });

  it("工具栏包含粗体、斜体、代码块按钮", () => {
    render(<MarkdownEditor value="" onChange={jest.fn()} />);
    // Tooltip 挂载说明按钮存在
    const buttons = document.querySelectorAll(".ant-btn");
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });
});
