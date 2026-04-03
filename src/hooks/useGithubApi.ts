import { useState, useCallback } from "react";
import {
  fetchFileContent,
  commitFile,
  commitMultipleFiles,
  fetchDirectoryStructure,
  addFileToDirectoryStructure,
  addDirectoryToStructure,
  removeFileFromDirectoryStructure,
  validateFilename,
} from "@/utils/github-api";
import { useEditorAuth } from "./useEditorAuth";
import { DirectoryNode } from "@/interface";

const NOTE_DIR_STRUCTURE_PATH = "src/utils/note-directory-structure.json";

export interface NoteFile {
  path: string;
  content: string;
  sha: string;
}

export interface UseGithubApiReturn {
  loading: boolean;
  error: string | null;
  /** 读取指定路径的笔记内容 */
  readNote: (path: string) => Promise<NoteFile>;
  /** 保存（更新）已存在的笔记 */
  saveNote: (path: string, content: string, sha: string) => Promise<void>;
  /** 删除笔记（同时更新目录结构 JSON） */
  deleteNote: (
    category: string,
    filename: string,
    structure: DirectoryNode[],
    subPath?: string,
  ) => Promise<void>;
  /** 发布新笔记（同时更新目录结构 JSON） */
  publishNote: (
    category: string,
    filename: string,
    content: string,
    structure: DirectoryNode[],
    subPath?: string,
  ) => Promise<void>;
  /** 创建新文件夹（更新目录结构 JSON） */
  createFolder: (
    category: string,
    folderName: string,
    structure: DirectoryNode[],
    subPath?: string,
  ) => Promise<void>;
  clearError: () => void;
}

/**
 * GitHub API 操作 Hook
 * 封装笔记的读、保存、发布、删除操作，并管理 loading/error 状态
 */
export function useGithubApi(): UseGithubApiReturn {
  const { token } = useEditorAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const withLoading = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      setLoading(true);
      setError(null);
      try {
        return await fn();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "未知错误";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const readNote = useCallback(
    (path: string) =>
      withLoading(async () => {
        const { content, sha } = await fetchFileContent(token, path);
        return { path, content, sha };
      }),
    [token, withLoading],
  );

  const saveNote = useCallback(
    (path: string, content: string, sha: string) =>
      withLoading(async () => {
        const filename = path.split("/").pop() ?? path;
        await commitFile(token, path, content, `docs: update ${filename}`, sha);
      }),
    [token, withLoading],
  );

  const publishNote = useCallback(
    (
      category: string,
      filename: string,
      content: string,
      structure: DirectoryNode[],
      subPath?: string,
    ) =>
      withLoading(async () => {
        const filenameWithExt = filename.endsWith(".md")
          ? filename
          : `${filename}.md`;
        const validation = validateFilename(filename);
        if (!validation.valid) throw new Error(validation.error);

        const subDir = subPath ? `${subPath}/` : "";
        const notePath = `src/note/${category}/${subDir}${filenameWithExt}`;
        const updatedStructure = addFileToDirectoryStructure(
          structure,
          category,
          filenameWithExt,
          subPath,
        );

        await commitMultipleFiles(
          token,
          [
            { path: notePath, content },
            {
              path: NOTE_DIR_STRUCTURE_PATH,
              content: JSON.stringify(updatedStructure, null, 2),
            },
          ],
          `docs: add note ${category}/${subPath ? subPath + "/" : ""}${filenameWithExt}`,
        );
      }),
    [token, withLoading],
  );

  const deleteNote = useCallback(
    (
      category: string,
      filename: string,
      structure: DirectoryNode[],
      subPath?: string,
    ) =>
      withLoading(async () => {
        const filenameWithExt = filename.endsWith(".md")
          ? filename
          : `${filename}.md`;
        const subDir = subPath ? `${subPath}/` : "";
        const notePath = `src/note/${category}/${subDir}${filenameWithExt}`;
        const updatedStructure = removeFileFromDirectoryStructure(
          structure,
          category,
          filenameWithExt,
          subPath,
        );

        await commitMultipleFiles(
          token,
          [
            { path: notePath, content: null },
            {
              path: NOTE_DIR_STRUCTURE_PATH,
              content: JSON.stringify(updatedStructure, null, 2),
            },
          ],
          `docs: delete note ${category}/${subDir}${filenameWithExt}`,
        );
      }),
    [token, withLoading],
  );

  const createFolder = useCallback(
    (
      category: string,
      folderName: string,
      structure: DirectoryNode[],
      subPath?: string,
    ) =>
      withLoading(async () => {
        if (!folderName.trim()) throw new Error("文件夹名称不能为空");
        if (/[/\\]/.test(folderName))
          throw new Error("文件夹名称不能含路径分隔符");
        const updatedStructure = addDirectoryToStructure(
          structure,
          category,
          folderName,
          subPath,
        );
        await commitFile(
          token,
          NOTE_DIR_STRUCTURE_PATH,
          JSON.stringify(updatedStructure, null, 2),
          `docs: create folder ${category}/${subPath ? subPath + "/" : ""}${folderName}`,
        );
      }),
    [token, withLoading],
  );

  return {
    loading,
    error,
    readNote,
    saveNote,
    deleteNote,
    publishNote,
    createFolder,
    clearError,
  };
}

export { fetchDirectoryStructure };
