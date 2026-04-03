import {
  fetchFileContent,
  commitFile,
  commitMultipleFiles,
  addFileToDirectoryStructure,
  removeFileFromDirectoryStructure,
  validateFilename,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_BRANCH,
} from "./github-api";
import { DirectoryNode } from "@/interface";

// ─── 测试数据 ────────────────────────────────────────────────────────────────

const MOCK_TOKEN = "github_pat_mock_token_123";
const MOCK_PATH = "src/note/program/test.md";
const MOCK_CONTENT = "# Test\nHello world";
const MOCK_SHA = "abc123sha";

// UTF-8 → base64（与 github-api.ts 中 btoa(unescape(encodeURIComponent(s))) 对应）
function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

// ─── fetchFileContent ─────────────────────────────────────────────────────────

describe("fetchFileContent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("返回正确解码的文件内容和 SHA", async () => {
    const encodedContent = encodeBase64(MOCK_CONTENT);
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: encodedContent, sha: MOCK_SHA }),
    } as Response);

    const result = await fetchFileContent(MOCK_TOKEN, MOCK_PATH);

    expect(result.content).toBe(MOCK_CONTENT);
    expect(result.sha).toBe(MOCK_SHA);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/`,
      ),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${MOCK_TOKEN}`,
        }),
      }),
    );
  });

  it("API 返回 404 时抛出含状态码的错误", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: "Not Found" }),
    } as Response);

    await expect(fetchFileContent(MOCK_TOKEN, MOCK_PATH)).rejects.toThrow(
      "404",
    );
  });

  it("API 返回 401 时抛出含状态码的错误", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: "Bad credentials" }),
    } as Response);

    await expect(fetchFileContent(MOCK_TOKEN, MOCK_PATH)).rejects.toThrow(
      "401",
    );
  });
});

// ─── commitFile ───────────────────────────────────────────────────────────────

describe("commitFile", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("新建文件时发送不含 sha 字段的请求体", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    await commitFile(MOCK_TOKEN, MOCK_PATH, MOCK_CONTENT, "docs: add test");

    const call = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(call[1].body as string) as Record<string, unknown>;
    expect(body.sha).toBeUndefined();
    expect(body.content).toBe(encodeBase64(MOCK_CONTENT));
    expect(body.branch).toBe(GITHUB_BRANCH);
    expect(body.message).toBe("docs: add test");
  });

  it("更新文件时请求体含正确的 sha 字段", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    await commitFile(
      MOCK_TOKEN,
      MOCK_PATH,
      MOCK_CONTENT,
      "docs: update test",
      MOCK_SHA,
    );

    const call = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(call[1].body as string) as Record<string, unknown>;
    expect(body.sha).toBe(MOCK_SHA);
  });

  it("API 失败时抛出错误", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ message: "SHA mismatch" }),
    } as Response);

    await expect(
      commitFile(MOCK_TOKEN, MOCK_PATH, MOCK_CONTENT, "docs: test"),
    ).rejects.toThrow("422");
  });
});

// ─── commitMultipleFiles ──────────────────────────────────────────────────────

describe("commitMultipleFiles", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  function setupMocks() {
    global.fetch = jest
      .fn()
      // 1. GET ref
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ object: { sha: "latest-commit-sha" } }),
      } as Response)
      // 2. GET commit
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tree: { sha: "base-tree-sha" } }),
      } as Response)
      // 3. POST tree
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sha: "new-tree-sha" }),
      } as Response)
      // 4. POST commit
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sha: "new-commit-sha" }),
      } as Response)
      // 5. PATCH ref
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);
  }

  it("按顺序调用 5 个 GitHub API 端点", async () => {
    setupMocks();

    await commitMultipleFiles(
      MOCK_TOKEN,
      [{ path: MOCK_PATH, content: MOCK_CONTENT }],
      "docs: test multi",
    );

    expect(global.fetch).toHaveBeenCalledTimes(5);
  });

  it("createTree 请求体含 base_tree 和正确的 tree 条目", async () => {
    setupMocks();

    await commitMultipleFiles(
      MOCK_TOKEN,
      [{ path: MOCK_PATH, content: MOCK_CONTENT }],
      "docs: test",
    );

    const createTreeCall = (global.fetch as jest.Mock).mock.calls[2];
    const body = JSON.parse(createTreeCall[1].body as string) as {
      base_tree: string;
      tree: Array<{ path: string; content: string }>;
    };
    expect(body.base_tree).toBe("base-tree-sha");
    expect(body.tree[0].path).toBe(MOCK_PATH);
    expect(body.tree[0].content).toBe(MOCK_CONTENT);
  });

  it("删除文件时 tree 条目的 sha 为 null", async () => {
    setupMocks();

    await commitMultipleFiles(
      MOCK_TOKEN,
      [{ path: MOCK_PATH, content: null }],
      "docs: delete test",
    );

    const createTreeCall = (global.fetch as jest.Mock).mock.calls[2];
    const body = JSON.parse(createTreeCall[1].body as string) as {
      tree: Array<{ sha: null }>;
    };
    expect(body.tree[0].sha).toBeNull();
  });

  it("createCommit 使用正确的 tree SHA 和 parent", async () => {
    setupMocks();

    await commitMultipleFiles(
      MOCK_TOKEN,
      [{ path: MOCK_PATH, content: MOCK_CONTENT }],
      "docs: test",
    );

    const createCommitCall = (global.fetch as jest.Mock).mock.calls[3];
    const body = JSON.parse(createCommitCall[1].body as string) as {
      tree: string;
      parents: string[];
    };
    expect(body.tree).toBe("new-tree-sha");
    expect(body.parents).toContain("latest-commit-sha");
  });

  it("第一步 API 失败时抛出错误并不继续后续调用", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: "Not Found" }),
    } as Response);

    await expect(commitMultipleFiles(MOCK_TOKEN, [], "test")).rejects.toThrow();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

// ─── addFileToDirectoryStructure ─────────────────────────────────────────────

describe("addFileToDirectoryStructure", () => {
  const baseStructure: DirectoryNode[] = [
    {
      name: "program",
      type: "directory",
      children: [
        {
          name: "existing.md",
          type: "file",
          lastModified: "2025-01-01T00:00:00.000Z",
        },
      ],
    },
  ];

  it("在已有分类下添加新文件", () => {
    const result = addFileToDirectoryStructure(
      baseStructure,
      "program",
      "new-note.md",
    );
    const programDir = result.find((n) => n.name === "program");
    expect(programDir?.children).toHaveLength(2);
    expect(
      programDir?.children?.find((c) => c.name === "new-note.md"),
    ).toBeDefined();
  });

  it("分类不存在时创建新分类节点", () => {
    const result = addFileToDirectoryStructure(
      baseStructure,
      "history",
      "note.md",
    );
    const historyDir = result.find((n) => n.name === "history");
    expect(historyDir).toBeDefined();
    expect(historyDir?.children).toHaveLength(1);
    expect(historyDir?.children?.[0].name).toBe("note.md");
  });

  it("不修改原始结构（纯函数）", () => {
    const original = JSON.stringify(baseStructure);
    addFileToDirectoryStructure(baseStructure, "program", "new.md");
    expect(JSON.stringify(baseStructure)).toBe(original);
  });

  it("新增文件节点含 lastModified 时间戳", () => {
    const result = addFileToDirectoryStructure(
      baseStructure,
      "program",
      "timed.md",
    );
    const programDir = result.find((n) => n.name === "program");
    const newFile = programDir?.children?.find((c) => c.name === "timed.md");
    expect(newFile?.lastModified).toBeDefined();
  });
});

// ─── removeFileFromDirectoryStructure ────────────────────────────────────────

describe("removeFileFromDirectoryStructure", () => {
  const baseStructure: DirectoryNode[] = [
    {
      name: "program",
      type: "directory",
      children: [
        {
          name: "to-delete.md",
          type: "file",
          lastModified: "2025-01-01T00:00:00.000Z",
        },
        {
          name: "keep.md",
          type: "file",
          lastModified: "2025-01-02T00:00:00.000Z",
        },
      ],
    },
  ];

  it("从分类下删除指定文件", () => {
    const result = removeFileFromDirectoryStructure(
      baseStructure,
      "program",
      "to-delete.md",
    );
    const programDir = result.find((n) => n.name === "program");
    expect(
      programDir?.children?.find((c) => c.name === "to-delete.md"),
    ).toBeUndefined();
    expect(
      programDir?.children?.find((c) => c.name === "keep.md"),
    ).toBeDefined();
  });

  it("不修改原始结构（纯函数）", () => {
    const original = JSON.stringify(baseStructure);
    removeFileFromDirectoryStructure(baseStructure, "program", "to-delete.md");
    expect(JSON.stringify(baseStructure)).toBe(original);
  });

  it("文件不存在时原样返回", () => {
    const result = removeFileFromDirectoryStructure(
      baseStructure,
      "program",
      "non-existent.md",
    );
    const programDir = result.find((n) => n.name === "program");
    expect(programDir?.children).toHaveLength(2);
  });
});

// ─── validateFilename ─────────────────────────────────────────────────────────

describe("validateFilename", () => {
  it("允许合法文件名（字母）", () => {
    expect(validateFilename("my-note").valid).toBe(true);
  });

  it("允许含中文的文件名", () => {
    expect(validateFilename("我的笔记").valid).toBe(true);
  });

  it("允许含数字和连字符的文件名", () => {
    expect(validateFilename("note-2025-01").valid).toBe(true);
  });

  it("拒绝空文件名", () => {
    const result = validateFilename("  ");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("不能为空");
  });

  it("拒绝含路径分隔符 / 的文件名", () => {
    const result = validateFilename("path/to/file");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("路径分隔符");
  });

  it("拒绝含路径穿越字符 .. 的文件名", () => {
    const result = validateFilename("../../etc/passwd");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("路径穿越");
  });

  it("拒绝含特殊字符 < > 的文件名", () => {
    const result = validateFilename("note<script>");
    expect(result.valid).toBe(false);
  });
});
