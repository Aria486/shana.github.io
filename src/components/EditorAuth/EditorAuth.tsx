import React, { useState } from "react";
import { Form, Input, Button, Typography, Alert, Space } from "antd";
import { KeyOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import "./style.scss";

const { Title, Text, Link } = Typography;

interface EditorAuthProps {
  validating: boolean;
  onSubmit: (token: string) => Promise<void>;
}

/**
 * PAT 认证表单
 * 未认证时展示，引导用户输入 GitHub Fine-grained Personal Access Token
 */
export const EditorAuth: React.FC<EditorAuthProps> = ({ validating, onSubmit }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;
    setErrorMsg(null);
    try {
      await onSubmit(inputValue.trim());
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("editor.auth.unknownError");
      setErrorMsg(message);
    }
  };

  return (
    <div className="editor-auth">
      <div className="editor-auth__card">
        <Space orientation="vertical" size="large" style={{ width: "100%" }}>
          <div className="editor-auth__header">
            <KeyOutlined className="editor-auth__icon" />
            <Title level={3}>{t("editor.auth.title")}</Title>
            <Text type="secondary">{t("editor.auth.description")}</Text>
          </div>

          {errorMsg && (
            <Alert
              type="error"
              message={errorMsg}
              showIcon
              closable
              onClose={() => setErrorMsg(null)}
            />
          )}

          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label={t("editor.auth.tokenLabel")}
              extra={
                <Link
                  href="https://github.com/settings/tokens?type=beta"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("editor.auth.tokenHelpLink")}
                </Link>
              }
            >
              <Input.Password
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t("editor.auth.tokenPlaceholder")}
                autoComplete="off"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={validating}
                block
              >
                {validating
                  ? t("editor.auth.validating")
                  : t("editor.auth.submit")}
              </Button>
            </Form.Item>
          </Form>

          <Text type="secondary" className="editor-auth__hint">
            {t("editor.auth.securityHint")}
          </Text>
        </Space>
      </div>
    </div>
  );
};
