import { renderHook, act } from "@testing-library/react";
import { useEditorAuth } from "./useEditorAuth";

const MOCK_TOKEN = "github_pat_test_token_valid";

describe("useEditorAuth", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
  });

  it("初始状态：无 token，isAuthenticated 为 false", () => {
    const { result } = renderHook(() => useEditorAuth());
    expect(result.current.token).toBe("");
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("localStorage 中已有 token 时自动恢复认证状态", () => {
    localStorage.setItem("editor_github_pat", MOCK_TOKEN);
    const { result } = renderHook(() => useEditorAuth());
    expect(result.current.token).toBe(MOCK_TOKEN);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("setToken 成功时将 token 存入 localStorage", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ login: "Aria486" }),
    } as Response);

    const { result } = renderHook(() => useEditorAuth());
    await act(async () => {
      await result.current.setToken(MOCK_TOKEN);
    });

    expect(result.current.token).toBe(MOCK_TOKEN);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem("editor_github_pat")).toBe(MOCK_TOKEN);
  });

  it("setToken 收到 401 时抛出错误且不存储 token", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: "Bad credentials" }),
    } as Response);

    const { result } = renderHook(() => useEditorAuth());
    await act(async () => {
      await expect(result.current.setToken("invalid_token")).rejects.toThrow(
        "401",
      );
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem("editor_github_pat")).toBeNull();
  });

  it("clearToken 后 isAuthenticated 变为 false 且 localStorage 被清除", async () => {
    localStorage.setItem("editor_github_pat", MOCK_TOKEN);
    const { result } = renderHook(() => useEditorAuth());

    act(() => {
      result.current.clearToken();
    });

    expect(result.current.token).toBe("");
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem("editor_github_pat")).toBeNull();
  });

  it("setToken 调用期间 validating 为 true", async () => {
    let resolvePromise!: () => void;
    global.fetch = jest.fn().mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolvePromise = () =>
          resolve({
            ok: true,
            status: 200,
            json: async () => ({}),
          } as Response);
      }),
    );

    const { result } = renderHook(() => useEditorAuth());
    let setTokenPromise: Promise<void>;
    act(() => {
      setTokenPromise = result.current.setToken(MOCK_TOKEN);
    });

    expect(result.current.validating).toBe(true);

    await act(async () => {
      resolvePromise();
      await setTokenPromise;
    });

    expect(result.current.validating).toBe(false);
  });
});
