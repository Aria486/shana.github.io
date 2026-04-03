import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { EditorAuth } from "./EditorAuth";

jest.mock("antd", () => ({
  Form: Object.assign(
    ({ children, onFinish }: { children: React.ReactNode; onFinish?: () => void }) => (
      <form
        data-testid="auth-form"
        onSubmit={(e) => {
          e.preventDefault();
          onFinish && onFinish();
        }}
      >
        {children}
      </form>
    ),
    { Item: ({ children }: { children: React.ReactNode }) => <div>{children}</div> },
  ),
  Input: Object.assign(
    (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
    { Password: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input type="password" {...props} /> },
  ),
  Button: ({ children, onClick, loading, htmlType }: { children: React.ReactNode; onClick?: () => void; loading?: boolean; htmlType?: "button" | "submit" | "reset" }) => (
    <button
      onClick={onClick}
      type={htmlType || "button"}
      disabled={loading}
    >
      {children}
    </button>
  ),
  Typography: {
    Title: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
    Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    Link: ({ children, href }: { children: React.ReactNode; href?: string }) => <a href={href}>{children}</a>,
  },
  Alert: ({ message, closable, onClose }: { message: React.ReactNode; closable?: boolean; onClose?: () => void }) => (
    <div role="alert">
      {message}
      {closable && <button onClick={onClose}>close</button>}
    </div>
  ),
  Space: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@ant-design/icons", () => ({
  KeyOutlined: () => <span data-testid="key-icon" />,
}));

describe("EditorAuth", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("渲染 Token 输入框和提交按钮", () => {
    render(<EditorAuth validating={false} onSubmit={mockOnSubmit} />);
    expect(screen.getByText("editor.auth.submit")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("editor.auth.tokenPlaceholder")).toBeInTheDocument();
  });

  it("点击提交时调用 onSubmit", async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);
    render(<EditorAuth validating={false} onSubmit={mockOnSubmit} />);
    const input = screen.getByPlaceholderText("editor.auth.tokenPlaceholder");
    fireEvent.change(input, { target: { value: "github_pat_test" } });
    fireEvent.submit(screen.getByTestId("auth-form"));
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith("github_pat_test");
    });
  });

  it("onSubmit 失败时显示错误提示", async () => {
    mockOnSubmit.mockRejectedValueOnce(new Error("Token 无效（HTTP 401）"));
    render(<EditorAuth validating={false} onSubmit={mockOnSubmit} />);
    const input = screen.getByPlaceholderText("editor.auth.tokenPlaceholder");
    fireEvent.change(input, { target: { value: "invalid_token" } });
    await act(async () => {
      fireEvent.submit(screen.getByTestId("auth-form"));
    });
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Token 无效（HTTP 401）");
    });
  });

  it("validating 为 true 时按钮显示验证中文案", () => {
    render(<EditorAuth validating={true} onSubmit={mockOnSubmit} />);
    expect(screen.getByText("editor.auth.validating")).toBeInTheDocument();
  });
});
