import React, { useState } from "react";
import { Collapse, Typography, Empty, Button, Tooltip } from "antd";
import { FileTextOutlined, FolderOpenOutlined, RightOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { DirectoryNode } from "@/interface";
import "./style.scss";

const { Text } = Typography;

interface NoteFilePickerProps {
  structure: DirectoryNode[];
  selectedPath?: string;
  /** 选中文件夹作为创建位置：category + subPath（相对 category 的子路径） */
  onSelectFolder?: (category: string, subPath: string) => void;
  onSelect: (category: string, filename: string, path: string) => void;
}

interface TreeNodeProps {
  nodes: DirectoryNode[];
  pathPrefix: string;
  category: string;
  selectedPath?: string;
  onSelect: (category: string, filename: string, path: string) => void;
  onSelectFolder?: (category: string, subPath: string) => void;
  depth: number;
}

/** 单个子目录折叠节点（可选中为创建位置） */
const SubDirNode: React.FC<{
  node: DirectoryNode;
  pathPrefix: string;
  category: string;
  selectedPath?: string;
  onSelect: (category: string, filename: string, path: string) => void;
  onSelectFolder?: (category: string, subPath: string) => void;
  depth: number;
}> = ({ node, pathPrefix, category, selectedPath, onSelect, onSelectFolder, depth }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  // subPath 相对于 category 的路径
  const subPath = pathPrefix.startsWith(category + "/")
    ? pathPrefix.slice(category.length + 1) + "/" + node.name
    : node.name;
  const fullPath = `${pathPrefix}/${node.name}`;

  return (
    <div>
      <div
        className="note-file-picker__subdir"
        style={{ paddingLeft: depth * 14 }}
      >
        <span
          className="note-file-picker__subdir-expand"
          onClick={() => setOpen((o) => !o)}
        >
          <RightOutlined
            className={`note-file-picker__subdir-arrow${open ? " note-file-picker__subdir-arrow--open" : ""}`}
          />
          <FolderOpenOutlined className="note-file-picker__subdir-icon" />
          <Text ellipsis title={node.name} className="note-file-picker__subdir-name">
            {node.name}
          </Text>
        </span>
        {onSelectFolder && (
          <Tooltip title={t("editor.picker.createHere")}>
            <Button
              size="small"
              type="text"
              icon={<PlusOutlined />}
              className="note-file-picker__subdir-add"
              onClick={(e) => {
                e.stopPropagation();
                onSelectFolder(category, subPath);
              }}
            />
          </Tooltip>
        )}
      </div>
      {open && (
        <TreeNodes
          nodes={node.children ?? []}
          pathPrefix={fullPath}
          category={category}
          selectedPath={selectedPath}
          onSelect={onSelect}
          onSelectFolder={onSelectFolder}
          depth={depth + 1}
        />
      )}
    </div>
  );
};

/** 递归渲染一组节点（文件 + 子目录） */
const TreeNodes: React.FC<TreeNodeProps> = ({
  nodes,
  pathPrefix,
  category,
  selectedPath,
  onSelect,
  onSelectFolder,
  depth,
}) => (
  <>
    {nodes.map((node) => {
      const currentPath = `${pathPrefix}/${node.name}`;
      if (node.type === "file") {
        const isSelected = selectedPath === currentPath;
        return (
          <div
            key={node.name}
            className={`note-file-picker__item${isSelected ? " note-file-picker__item--selected" : ""}`}
            style={{ paddingLeft: depth * 14 + 8 }}
            onClick={() => onSelect(category, node.name, currentPath)}
          >
            <FileTextOutlined className="note-file-picker__file-icon" />
            <Text ellipsis title={node.name}>
              {node.name}
            </Text>
          </div>
        );
      }
      return (
        <SubDirNode
          key={node.name}
          node={node}
          pathPrefix={pathPrefix}
          category={category}
          selectedPath={selectedPath}
          onSelect={onSelect}
          onSelectFolder={onSelectFolder}
          depth={depth}
        />
      );
    })}
  </>
);

/**
 * 笔记文件选择器
 * - 点击文件 → onSelect
 * - 点击文件夹旁边的 + → onSelectFolder（选为创建位置）
 */
export const NoteFilePicker: React.FC<NoteFilePickerProps> = ({
  structure,
  selectedPath,
  onSelect,
  onSelectFolder,
}) => {
  const { t } = useTranslation();
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  if (!structure.length) {
    return <Empty description={t("editor.picker.empty")} />;
  }

  const collapseItems = structure
    .filter((node) => node.type === "directory")
    .map((categoryNode) => ({
      key: categoryNode.name,
      label: (
        <span className="note-file-picker__category">
          <FolderOpenOutlined />
          <span className="note-file-picker__category-name">{categoryNode.name}</span>
          {onSelectFolder && (
            <Tooltip title={t("editor.picker.createHere")}>
              <Button
                size="small"
                type="text"
                icon={<PlusOutlined />}
                className="note-file-picker__category-add"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFolder(categoryNode.name, "");
                }}
              />
            </Tooltip>
          )}
        </span>
      ),
      children: (
        <TreeNodes
          nodes={categoryNode.children ?? []}
          pathPrefix={categoryNode.name}
          category={categoryNode.name}
          selectedPath={selectedPath}
          onSelect={onSelect}
          onSelectFolder={onSelectFolder}
          depth={1}
        />
      ),
    }));

  return (
    <div className="note-file-picker">
      <div className="note-file-picker__title">
        <Text strong>{t("editor.picker.title")}</Text>
      </div>
      <Collapse
        activeKey={activeKeys}
        onChange={(keys) => setActiveKeys(keys as string[])}
        items={collapseItems}
        ghost
        size="small"
      />
    </div>
  );
};
