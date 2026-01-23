import React from "react";
import classnames from "classnames";
import { Select } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useClsAddPrefix } from "@/hooks";
import { ICommonComponent } from "@/interface";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ThemeSwitch } from "@/components";
import { ROOT_PATH } from "@/utils/constants";
import "./style.scss";

export interface IFooter extends ICommonComponent {
  showThemeSwitch?: boolean;
  showLanguageSwitch?: boolean;
}

export const Footer: React.FC<IFooter> = (props) => {
  const { className, showThemeSwitch = true, showLanguageSwitch = true } = props;
  const prefixCls = useClsAddPrefix("footer");
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const nav = useNavigate();
  const urlParams = useParams();
  const lang = urlParams.lang;
  const currentYear = new Date().getFullYear();

  const languageOptions = [
    { label: "中文", value: "zh-CN" },
    { label: "English", value: "en" },
    { label: "日本語", value: "ja" }
  ];

  const handleLanguageChange = (newLang: string) => {
    // 构建新的路径，替换当前语言参数
    const currentPath = pathname.replace(`${ROOT_PATH}/${lang}`, '');
    const newPath = `${ROOT_PATH}/${newLang}${currentPath}`;

    // 切换语言并导航到新路径
    i18n.changeLanguage(newLang);
    nav(newPath);
  };

  return (
    <footer className={classnames(prefixCls, className)}>
      <div className={`${prefixCls}-content`}>
        <div className={`${prefixCls}-info`}>
          <p className={`${prefixCls}-description`}>
            {t("footer.description")}
          </p>
        </div>

        <div className={`${prefixCls}-actions`}>
          {showLanguageSwitch && (
            <div className={`${prefixCls}-language-switch`}>
              <Select
                value={lang}
                onChange={handleLanguageChange}
                options={languageOptions}
                suffixIcon={<GlobalOutlined />}
                style={{ width: 90 }}
                size="small"
              />
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};