import React from "react";
import { useParams, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

// 语言包装器组件，用于设置语言
export const LangWrapper: React.FC = () => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  React.useEffect(() => {
    if (lang && ['zh-CN', 'en', 'ja'].includes(lang)) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  return <Outlet />;
};