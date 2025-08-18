import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
// import { zh, en } from "./lang";
import zh1 from "./lang/zh-CN/translation.json";
import en1 from "./lang/en/translation.json";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: "zh-CN",
    interpolation: {
      escapeValue: false
    },
    resources: zh1
  });

export default i18n;
