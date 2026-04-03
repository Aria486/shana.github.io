/**
 * GitHub REST API 工具函数
 * 纯函数，无 React 依赖，使用原生 fetch + Authorization: Bearer {token}
 */
import { DirectoryNode } from "@/interface";

export const GITHUB_OWNER = "Aria486";
export const GITHUB_REPO = "shana.github.io";
export const GITHUB_BRANCH = "vite-react";
const GITHUB_API_BASE = "https://api.github.com";
const NOTE_DIR_STRUCTURE_PATH = "src/utils/note-directory-structure.json";

// ─── 内部辅助 ────────────────────────────────────────────────────────────────

function buildHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function assertOk(res: Response, context: string): Promise<void> {
  if (!res.ok) {
    let message = `${context} 失败（HTTP ${res.status}）`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message += `：${body.message}`;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }
}

// ─── 文件读写 API ─────────────────────────────────────────────────────────────

/**
 * 读取仓库中指定路径的文件内容
 * @returns { content: UTF-8 文本内容, sha: 当前文件 SHA }
 */
export async function fetchFileContent(
  token: string,
  path: string,
): Promise<{ content: string; sha: string }> {
  const url = `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(path)}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(url, { headers: buildHeaders(token) });
  await assertOk(res, `读取文件 ${path}`);
  const data = (await res.json()) as { content: string; sha: string };
  const content = decodeURIComponent(
    escape(atob(data.content.replace(/\n/g, ""))),
  );
  return { content, sha: data.sha };
}

/**
 * 新建或更新单个文件（仅用于编辑现有笔记，不需要同时更新目录结构 JSON）
 * @param sha 已有文件的 SHA（更新时必须提供，新建则省略）
 */
export async function commitFile(
  token: string,
  path: string,
  content: string,
  message: string,
  sha?: string,
): Promise<void> {
  const url = `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(path)}`;
  const body: Record<string, unknown> = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch: GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: "PUT",
    headers: buildHeaders(token),
    body: JSON.stringify(body),
  });
  await assertOk(res, `提交文件 ${path}`);
}

// ─── Git Trees API（原子多文件提交）────────────────────────────────────────────

export interface GitFileEntry {
  /** 仓库内相对路径，如 "src/note/program/test.md" */
  path: string;
  /** 文件内容（UTF-8 字符串）；传 null 则删除该文件 */
  content: string | null;
}

/**
 * 使用 Git Trees API 原子提交多个文件（可同时新建/更新/删除）
 * 流程：获取最新 commit → createTree → createCommit → updateRef
 */
export async function commitMultipleFiles(
  token: string,
  files: GitFileEntry[],
  message: string,
): Promise<void> {
  const headers = buildHeaders(token);

  // 1. 获取分支最新 commit SHA
  const refUrl = `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs/heads/${GITHUB_BRANCH}`;
  const refRes = await fetch(refUrl, { headers });
  await assertOk(refRes, "获取分支 ref");
  const refData = (await refRes.json()) as { object: { sha: string } };
  const latestCommitSha = refData.object.sha;

  // 2. 获取该 commit 的 tree SHA
  const commitUrl = `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/commits/${latestCommitSha}`;
  const commitRes = await fetch(commitUrl, { headers });
  await assertOk(commitRes, "获取 commit 信息");
  const commitData = (await commitRes.json()) as { tree: { sha: string } };
  const baseTreeSha = commitData.tree.sha;

  // 3. 创建新 tree（传 null content 表示删除）
  const treeItems = files.map((f) => {
    if (f.content === null) {
      return { path: f.path, mode: "100644", type: "blob", sha: null };
    }
    return {
      path: f.path,
      mode: "100644",
      type: "blob",
      content: f.content,
    };
  });

  const newTreeRes = await fetch(
    `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/trees`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
    },
  );
  await assertOk(newTreeRes, "创建 Git tree");
  const newTreeData = (await newTreeRes.json()) as { sha: string };

  // 4. 创建新 commit
  const newCommitRes = await fetch(
    `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/commits`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        message,
        tree: newTreeData.sha,
        parents: [latestCommitSha],
      }),
    },
  );
  await assertOk(newCommitRes, "创建 commit");
  const newCommitData = (await newCommitRes.json()) as { sha: string };

  // 5. 更新分支 ref
  const updateRefRes = await fetch(refUrl, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ sha: newCommitData.sha }),
  });
  await assertOk(updateRefRes, "更新分支 ref");
}

// ─── 目录结构 JSON 内存操作（纯函数）────────────────────────────────────────────

/**
 * 在内存中向目录结构 JSON 的指定路径下添加文件节点
 * @param structure 当前目录结构数组（将被深拷贝，不修改原对象）
 * @param category  一级分类名，如 "program"
 * @param filename  文件名（含扩展名），如 "my-note.md"
 * @param subPath   可选的子目录路径，如 "react" 或 "react/hooks"
 * @returns 更新后的新目录结构数组
 */
export function addFileToDirectoryStructure(
  structure: DirectoryNode[],
  category: string,
  filename: string,
  subPath?: string,
): DirectoryNode[] {
  const cloned: DirectoryNode[] = JSON.parse(JSON.stringify(structure));
  let categoryNode = cloned.find(
    (n) => n.type === "directory" && n.name === category,
  );
  if (!categoryNode) {
    categoryNode = { name: category, type: "directory", children: [] };
    cloned.push(categoryNode);
  }
  if (!categoryNode.children) categoryNode.children = [];

  // 按 subPath 逐层找到或创建子目录
  let targetNode: DirectoryNode = categoryNode;
  if (subPath) {
    const parts = subPath.split("/").filter(Boolean);
    for (const part of parts) {
      let subNode = targetNode.children?.find(
        (n) => n.type === "directory" && n.name === part,
      );
      if (!subNode) {
        subNode = { name: part, type: "directory", children: [] };
        if (!targetNode.children) targetNode.children = [];
        targetNode.children.push(subNode);
      }
      if (!subNode.children) subNode.children = [];
      targetNode = subNode;
    }
  }

  targetNode.children!.push({
    name: filename,
    type: "file",
    lastModified: new Date().toISOString(),
  });
  return cloned;
}

/**
 * 在内存中从目录结构 JSON 的指定路径下删除文件节点
 * @param structure 当前目录结构数组（将被深拷贝，不修改原对象）
 * @param category  一级分类名
 * @param filename  文件名（含扩展名）
 * @param subPath   可选的子目录路径，如 "react" 或 "react/hooks"
 * @returns 更新后的新目录结构数组
 */
export function removeFileFromDirectoryStructure(
  structure: DirectoryNode[],
  category: string,
  filename: string,
  subPath?: string,
): DirectoryNode[] {
  const cloned: DirectoryNode[] = JSON.parse(JSON.stringify(structure));
  const categoryNode = cloned.find(
    (n) => n.type === "directory" && n.name === category,
  );
  if (!categoryNode) return cloned;

  // 按 subPath 逐层定位目标目录节点
  let targetNode: DirectoryNode = categoryNode;
  if (subPath) {
    const parts = subPath.split("/").filter(Boolean);
    for (const part of parts) {
      const subNode = targetNode.children?.find(
        (n) => n.type === "directory" && n.name === part,
      );
      if (!subNode) return cloned;
      targetNode = subNode;
    }
  }

  if (targetNode.children) {
    targetNode.children = targetNode.children.filter(
      (child) => !(child.type === "file" && child.name === filename),
    );
  }
  return cloned;
}

/**
 * 在内存中向目录结构 JSON 新增一个文件夹节点
 * @param structure 当前目录结构数组（将被深拷贝，不修改原对象）
 * @param category  一级分类名，如 "program"（若不存在则自动创建）
 * @param folderName 新文件夹名称
 * @param subPath   父级子目录路径，如 "react"（空表示直接在 category 下创建）
 * @returns 更新后的新目录结构数组
 */
export function addDirectoryToStructure(
  structure: DirectoryNode[],
  category: string,
  folderName: string,
  subPath?: string,
): DirectoryNode[] {
  const cloned: DirectoryNode[] = JSON.parse(JSON.stringify(structure));
  let categoryNode = cloned.find(
    (n) => n.type === "directory" && n.name === category,
  );
  if (!categoryNode) {
    categoryNode = { name: category, type: "directory", children: [] };
    cloned.push(categoryNode);
  }
  if (!categoryNode.children) categoryNode.children = [];

  let targetNode: DirectoryNode = categoryNode;
  if (subPath) {
    const parts = subPath.split("/").filter(Boolean);
    for (const part of parts) {
      let sub = targetNode.children?.find(
        (n) => n.type === "directory" && n.name === part,
      );
      if (!sub) {
        sub = { name: part, type: "directory", children: [] };
        if (!targetNode.children) targetNode.children = [];
        targetNode.children.push(sub);
      }
      if (!sub.children) sub.children = [];
      targetNode = sub;
    }
  }

  const exists = targetNode.children?.some(
    (n) => n.type === "directory" && n.name === folderName,
  );
  if (!exists) {
    targetNode.children!.push({
      name: folderName,
      type: "directory",
      children: [],
    });
  }
  return cloned;
}

export async function fetchDirectoryStructure(
  token: string,
): Promise<{ structure: DirectoryNode[]; sha: string }> {
  const { content, sha } = await fetchFileContent(
    token,
    NOTE_DIR_STRUCTURE_PATH,
  );
  const structure = JSON.parse(content) as DirectoryNode[];
  return { structure, sha };
}

/**
 * 校验文件名安全性：仅允许字母、数字、中文、连字符、下划线、空格
 * 拒绝含路径分隔符或路径穿越字符的文件名
 */
export function validateFilename(filename: string): {
  valid: boolean;
  error?: string;
} {
  if (!filename.trim()) {
    return { valid: false, error: "文件名不能为空" };
  }
  if (/\.\./.test(filename)) {
    return { valid: false, error: "文件名不能含路径穿越字符（..）" };
  }
  if (/[/\\]/.test(filename)) {
    return { valid: false, error: "文件名不能含路径分隔符（/ 或 \\）" };
  }
  // 只允许字母、数字、中文、连字符、下划线、空格、点
  if (/[^a-zA-Z0-9\u4e00-\u9fff\-_ .]/.test(filename)) {
    return {
      valid: false,
      error: "文件名只能含字母、数字、中文、连字符（-）、下划线（_）",
    };
  }
  return { valid: true };
}
