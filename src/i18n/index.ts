import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 清除可能的缓存
localStorage.removeItem("i18nextLng");
sessionStorage.removeItem("i18nextLng");

// 使用新的 import.meta.glob 语法
const resources: Record<string, any> = {};
const localeModules = import.meta.glob("./locales/*.json", { eager: true });

console.log("加载的语言模块:", localeModules);

for (const path in localeModules) {
  const key = path.split("/").pop()?.split(".").shift() ?? "";
  resources[key] = { translation: (localeModules[path] as any).default };
  console.log(`加载语言: ${key}`, resources[key]);
}

console.log("最终资源:", resources);

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

console.log("i18n 初始化后的语言:", i18n.language);

i18n.on("languageChanged", (lng) => {
  console.log("语言已变更为:", lng);
  console.trace("语言变更调用栈"); // 查看是谁调用的
});

export default i18n;
