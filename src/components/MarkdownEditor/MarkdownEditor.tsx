import React, { useRef } from "react";
import { Button, Space, Tooltip } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import Markdown from "markdown-to-jsx";
import { useTranslation } from "react-i18next";
import { Code } from "@/components/Code";
import "./style.scss";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

type WrapFormat = {
  before: string;
  after: string;
  placeholder?: string;
};

const FORMATS: Record<string, WrapFormat> = {
  bold: { before: "**", after: "**", placeholder: "粗体文字" },
  italic: { before: "_", after: "_", placeholder: "斜体文字" },
  code: { before: "```\n", after: "\n```", placeholder: "代码" },
};

/**
 * Markdown 编辑器组件
 * 左侧编辑区（textarea）+ 右侧实时预览，提供常用格式工具栏
 */
export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (formatKey: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd } = textarea;
    const selected = value.slice(selectionStart, selectionEnd);
    const fmt = FORMATS[formatKey];
    const replacement = selected
      ? `${fmt.before}${selected}${fmt.after}`
      : `${fmt.before}${fmt.placeholder ?? ""}${fmt.after}`;
    const newValue =
      value.slice(0, selectionStart) + replacement + value.slice(selectionEnd);
    onChange(newValue);

    // 恢复焦点并设置光标位置
    requestAnimationFrame(() => {
      textarea.focus();
      const placeholder = fmt.placeholder ?? "";
      const cursorPos = selectionStart + fmt.before.length + (selected || placeholder).length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  };

  return (
    <div className="markdown-editor">
      <div className="markdown-editor__toolbar">
        <Space>
          <Tooltip title={t("editor.toolbar.bold")}>
            <Button
              size="small"
              icon={<BoldOutlined />}
              onClick={() => applyFormat("bold")}
            />
          </Tooltip>
          <Tooltip title={t("editor.toolbar.italic")}>
            <Button
              size="small"
              icon={<ItalicOutlined />}
              onClick={() => applyFormat("italic")}
            />
          </Tooltip>
          <Tooltip title={t("editor.toolbar.codeBlock")}>
            <Button
              size="small"
              icon={<CodeOutlined />}
              onClick={() => applyFormat("code")}
            />
          </Tooltip>
        </Space>
      </div>
      <div className="markdown-editor__body">
        <textarea
          ref={textareaRef}
          className="markdown-editor__input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("editor.editor.placeholder")}
          spellCheck={false}
        />
        <div className="markdown-editor__preview">
          <Markdown
            options={{
              overrides: {
                code: {
                  component: ({
                    className,
                    children,
                    ...rest
                  }: React.HTMLAttributes<HTMLElement>) => {
                    if (className && className.toString().startsWith("lang-")) {
                      const language = className.toString().replace("lang-", "");
                      return (
                        <Code language={language} isDark={false} {...rest}>
                          {children}
                        </Code>
                      );
                    }
                    return <code className={className as string} {...rest}>{children}</code>;
                  },
                },
              },
            }}
          >
            {value || `*${t("editor.editor.previewEmpty")}*`}
          </Markdown>
        </div>
      </div>
    </div>
  );
};
