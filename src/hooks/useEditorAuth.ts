import { useState, useCallback } from "react";

const PAT_STORAGE_KEY = "editor_github_pat";

/**
 * PAT 认证 Hook
 * 管理 GitHub Fine-grained Personal Access Token 的存储与验证
 */
export function useEditorAuth() {
  const [token, setTokenState] = useState<string>(
    () => localStorage.getItem(PAT_STORAGE_KEY) ?? "",
  );
  const [validating, setValidating] = useState(false);

  const isAuthenticated = token.length > 0;

  /**
   * 验证 Token 有效性后存入 localStorage
   * 验证失败时抛出 Error
   */
  const setToken = useCallback(async (newToken: string): Promise<void> => {
    setValidating(true);
    try {
      const res = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${newToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
      if (res.status === 401) {
        throw new Error("Token 无效，请检查是否正确复制（HTTP 401）");
      }
      if (!res.ok) {
        throw new Error(`Token 验证失败（HTTP ${res.status}）`);
      }
      localStorage.setItem(PAT_STORAGE_KEY, newToken);
      setTokenState(newToken);
    } finally {
      setValidating(false);
    }
  }, []);

  const clearToken = useCallback(() => {
    localStorage.removeItem(PAT_STORAGE_KEY);
    setTokenState("");
  }, []);

  return { token, setToken, clearToken, isAuthenticated, validating };
}
