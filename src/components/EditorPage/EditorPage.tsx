import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Input,
  Select,
  Space,
  Typography,
  Divider,
  Modal,
  notification,
  Alert,
  Spin,
  Tag,
} from "antd";
import {
  SaveOutlined,
  PlusOutlined,
  FolderAddOutlined,
  DeleteOutlined,
  LogoutOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { EditorAuth } from "@/components/EditorAuth";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { NoteFilePicker } from "@/components/NoteFilePicker";
import { useEditorAuth } from "@/hooks/useEditorAuth";
import { useGithubApi, fetchDirectoryStructure } from "@/hooks/useGithubApi";
import { validateFilename } from "@/utils/github-api";
import { NOTE_MENU } from "@/utils/constants";
import { DirectoryNode } from "@/interface";
import "./style.scss";

const { Title, Text } = Typography;
const { Option } = Select;

type EditorMode = "idle" | "editing" | "creating";

/**
 * 编辑器主页面
 * 包含认证门控：未认证显示 EditorAuth，已认证显示完整编辑器界面
 */
export const EditorPage: React.FC = () => {
  const { isAuthenticated, token, setToken, clearToken, validating } = useEditorAuth();

  if (!isAuthenticated) {
    return <EditorAuth validating={validating} onSubmit={setToken} />;
  }

  return <EditorMain token={token} onLogout={clearToken} />;
};

// ─── 编辑器主体（已认证）────────────────────────────────────────────────────────

interface EditorMainProps {
  token: string;
  onLogout: () => void;
}

const EditorMain: React.FC<EditorMainProps> = ({ token, onLogout }) => {
  const { t } = useTranslation();
  const { loading, error, readNote, saveNote, publishNote, deleteNote, createFolder, clearError } =
    useGithubApi();

  // 目录结构状态
  const [structure, setStructure] = useState<DirectoryNode[]>([]);
  const [structureLoading, setStructureLoading] = useState(true);
  const [structureError, setStructureError] = useState<string | null>(null);

  // 编辑状态
  const [mode, setMode] = useState<EditorMode>("idle");
  const [selectedPath, setSelectedPath] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedFilename, setSelectedFilename] = useState<string>("");
  const [currentSha, setCurrentSha] = useState<string>("");
  const [content, setContent] = useState("");

  // 新建笔记表单
  const [newCategory, setNewCategory] = useState<string>(NOTE_MENU[0] ?? "program");
  const [newSubPath, setNewSubPath] = useState("");
  const [newFilename, setNewFilename] = useState("");
  const [filenameError, setFilenameError] = useState<string | null>(null);

  // 当前编辑文件的子目录
  const [selectedSubPath, setSelectedSubPath] = useState("");

  // 新建文件夹 Modal
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderCategory, setFolderCategory] = useState<string>(NOTE_MENU[0] ?? "program");
  const [folderSubPath, setFolderSubPath] = useState("");
  const [folderName, setFolderName] = useState("");
  const [folderNameError, setFolderNameError] = useState<string | null>(null);

  const loadStructure = useCallback(async () => {
    setStructureLoading(true);
    setStructureError(null);
    try {
      const { structure: s } = await fetchDirectoryStructure(token);
      setStructure(s);
    } catch (err: unknown) {
      setStructureError(
        err instanceof Error ? err.message : t("editor.error.loadStructure"),
      );
    } finally {
      setStructureLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    loadStructure();
  }, [loadStructure]);

  const handleSelectFile = async (
    category: string,
    filename: string,
    path: string,
  ) => {
    // path = "category/subPath/filename.md"，提取中间的子目录部分
    const parts = path.split("/");
    const subPath = parts.slice(1, -1).join("/");
    const fullPath = `src/note/${path}`;
    try {
      const file = await readNote(fullPath);
      setContent(file.content);
      setCurrentSha(file.sha);
      setSelectedPath(path);
      setSelectedCategory(category);
      setSelectedFilename(filename);
      setSelectedSubPath(subPath);
      setMode("editing");
    } catch {
      // error is surfaced via `error` from useGithubApi
    }
  };

  const handleSave = async () => {
    if (!selectedPath || !currentSha) return;
    const fullPath = `src/note/${selectedPath}`;
    try {
      await saveNote(fullPath, content, currentSha);
      // 刷新 sha
      const updated = await readNote(fullPath);
      setCurrentSha(updated.sha);
      notification.success({
        message: t("editor.notification.saveSuccess"),
        description: t("editor.notification.deployHint"),
        duration: 5,
      });
    } catch {
      // error surfaced via `error` state
    }
  };

  const handlePublish = async () => {
    const validation = validateFilename(newFilename);
    if (!validation.valid) {
      setFilenameError(validation.error ?? t("editor.error.invalidFilename"));
      return;
    }
    setFilenameError(null);
    try {
      await publishNote(newCategory, newFilename, content, structure, newSubPath || undefined);
      notification.success({
        message: t("editor.notification.publishSuccess"),
        description: t("editor.notification.deployHint"),
        duration: 5,
      });
      setNewFilename("");
      setNewSubPath("");
      setContent("");
      setMode("idle");
      await loadStructure();
    } catch {
      // error surfaced via `error` state
    }
  };

  const handleDelete = () => {
    if (!selectedCategory || !selectedFilename) return;
    Modal.confirm({
      title: t("editor.delete.confirmTitle"),
      content: t("editor.delete.confirmContent", {
        name: selectedFilename,
        category: selectedCategory,
      }),
      okText: t("editor.delete.confirm"),
      okType: "danger",
      cancelText: t("editor.delete.cancel"),
      onOk: async () => {
        try {
          await deleteNote(selectedCategory, selectedFilename, structure, selectedSubPath || undefined);
          notification.success({
            message: t("editor.notification.deleteSuccess"),
            description: t("editor.notification.deployHint"),
            duration: 5,
          });
          setMode("idle");
          setSelectedPath(undefined);
          setContent("");
          await loadStructure();
        } catch {
          // error surfaced via `error` state
        }
      },
    });
  };

  const handleStartCreate = () => {
    setMode("creating");
    setSelectedPath(undefined);
    setContent("");
    setNewFilename("");
    setFilenameError(null);
    // 不重置 newCategory / newSubPath，保留上次选中的位置
  };

  /** 点击文件夹旁 + 按钮：设定新建位置后切换到创建模式 */
  const handleSelectFolder = (category: string, subPath: string) => {
    setNewCategory(category);
    setNewSubPath(subPath);
    setMode("creating");
    setSelectedPath(undefined);
    setContent("");
    setNewFilename("");
    setFilenameError(null);
  };

  /** 新建文件夹 */
  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      setFolderNameError(t("editor.folder.nameRequired"));
      return;
    }
    if (/[/\\]/.test(folderName)) {
      setFolderNameError(t("editor.folder.nameInvalid"));
      return;
    }
    setFolderNameError(null);
    try {
      await createFolder(folderCategory, folderName, structure, folderSubPath || undefined);
      notification.success({ message: t("editor.notification.folderSuccess"), duration: 3 });
      setFolderModalOpen(false);
      setFolderName("");
      setFolderSubPath("");
      await loadStructure();
    } catch {
      // error surfaced via `error` state
    }
  };

  return (
    <div className="editor-page">
      {/* 顶部栏 */}
      <div className="editor-page__header">
        <Title level={4} className="editor-page__title">
          {t("editor.title")}
        </Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadStructure}
            loading={structureLoading}
          >
            {t("editor.action.refresh")}
          </Button>
          <Button
            icon={<LogoutOutlined />}
            onClick={onLogout}
            danger
          >
            {t("editor.action.logout")}
          </Button>
        </Space>
      </div>

      {/* API 错误提示 */}
      {error && (
        <Alert
          type="error"
          message={error}
          closable
          onClose={clearError}
          style={{ marginBottom: 12 }}
          showIcon
        />
      )}

      <div className="editor-page__body">
        {/* 左侧：文件选择 + 新建表单 */}
        <div className="editor-page__sidebar">
          <div className="editor-page__sidebar-actions">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleStartCreate}
              block
            >
              {t("editor.action.newNote")}
            </Button>
            <Button
              icon={<FolderAddOutlined />}
              onClick={() => {
                setFolderCategory(NOTE_MENU[0] ?? "program");
                setFolderSubPath("");
                setFolderName("");
                setFolderNameError(null);
                setFolderModalOpen(true);
              }}
              block
              style={{ marginTop: 6 }}
            >
              {t("editor.action.newFolder")}
            </Button>
          </div>
          <Divider style={{ margin: "8px 0" }} />
          {structureLoading ? (
            <div className="editor-page__loading">
              <Spin size="small" />
            </div>
          ) : structureError ? (
            <Alert type="error" message={structureError} showIcon />
          ) : (
            <NoteFilePicker
              structure={structure}
              selectedPath={selectedPath}
              onSelect={handleSelectFile}
              onSelectFolder={handleSelectFolder}
            />
          )}
        </div>

        {/* 右侧：编辑区 */}
        <div className="editor-page__main">
          {mode === "creating" && (
            <div className="editor-page__new-form">
              {(newCategory || newSubPath) && (
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {t("editor.newNote.location")}:
                  </Text>{" "}
                  <Tag color="blue">
                    {newCategory}{newSubPath ? `/${newSubPath}` : ""}
                  </Tag>
                </div>
              )}
              <Space wrap>
                <Select
                  value={newCategory}
                  onChange={setNewCategory}
                  style={{ width: 140 }}
                >
                  {NOTE_MENU.map((cat) => (
                    <Option key={cat} value={cat}>
                      {cat}
                    </Option>
                  ))}
                </Select>
                <Input
                  value={newSubPath}
                  onChange={(e) => setNewSubPath(e.target.value)}
                  placeholder={t("editor.newNote.subPathPlaceholder")}
                  style={{ width: 180 }}
                  allowClear
                />
                <div>
                  <Input
                    value={newFilename}
                    onChange={(e) => {
                      setNewFilename(e.target.value);
                      setFilenameError(null);
                    }}
                    placeholder={t("editor.newNote.filenamePlaceholder")}
                    status={filenameError ? "error" : ""}
                    style={{ width: 240 }}
                    addonAfter=".md"
                  />
                  {filenameError && (
                    <Text type="danger" style={{ fontSize: 12 }}>
                      {filenameError}
                    </Text>
                  )}
                </div>
                <Button
                  type="primary"
                  loading={loading}
                  onClick={handlePublish}
                >
                  {t("editor.action.publish")}
                </Button>
              </Space>
            </div>
          )}

          {mode === "editing" && (
            <div className="editor-page__edit-actions">
              <Space>
                <Text type="secondary">{selectedFilename}</Text>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={loading}
                  onClick={handleSave}
                >
                  {t("editor.action.save")}
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  loading={loading}
                  onClick={handleDelete}
                >
                  {t("editor.action.delete")}
                </Button>
              </Space>
            </div>
          )}

          <div className="editor-page__editor">
            {mode === "idle" ? (
              <div className="editor-page__placeholder">
                <Text type="secondary">{t("editor.placeholder")}</Text>
              </div>
            ) : (
              <MarkdownEditor value={content} onChange={setContent} />
            )}
          </div>
        </div>
      </div>

      {/* 新建文件夹 Modal */}
      <Modal
        title={t("editor.folder.title")}
        open={folderModalOpen}
        onOk={handleCreateFolder}
        onCancel={() => setFolderModalOpen(false)}
        confirmLoading={loading}
        okText={t("editor.folder.confirm")}
        cancelText={t("editor.delete.cancel")}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <Text>{t("editor.folder.category")}</Text>
            <Select
              value={folderCategory}
              onChange={setFolderCategory}
              style={{ width: "100%", marginTop: 4 }}
            >
              {NOTE_MENU.map((cat) => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </div>
          <div>
            <Text>{t("editor.folder.subPath")}</Text>
            <Input
              value={folderSubPath}
              onChange={(e) => setFolderSubPath(e.target.value)}
              placeholder={t("editor.folder.subPathPlaceholder")}
              style={{ marginTop: 4 }}
              allowClear
            />
          </div>
          <div>
            <Text>{t("editor.folder.name")}</Text>
            <Input
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value);
                setFolderNameError(null);
              }}
              placeholder={t("editor.folder.namePlaceholder")}
              style={{ marginTop: 4 }}
              status={folderNameError ? "error" : ""}
            />
            {folderNameError && (
              <Text type="danger" style={{ fontSize: 12 }}>{folderNameError}</Text>
            )}
          </div>
        </Space>
      </Modal>
    </div>
  );
};

