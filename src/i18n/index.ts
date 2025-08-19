import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 清除可能的缓存
localStorage.removeItem("i18nextLng");
sessionStorage.removeItem("i18nextLng");

// 使用新的 import.meta.glob 语法
const resources: Record<string, any> = {};
const localeModules = import.meta.glob("./locales/*.json", { eager: true });

for (const path in localeModules) {
  const key = path.split("/").pop()?.split(".").shift() ?? "";
  resources[key] = { translation: (localeModules[path] as any).default };
}

i18n.use(initReactI18next).init({
  fallbackLng: "zh-CN",
  lng: "zh-CN",
  debug: true,
  resources,
  interpolation: { escapeValue: false },
  // 禁用语言检测
  detection: {
    order: [], // 禁用所有自动检测
  },
});

export default i18n;
