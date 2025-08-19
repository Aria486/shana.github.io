import React, { useState, useEffect } from "react";
import Prism from "prismjs";
// 导入你需要的语言
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
// 导入主题
import "prismjs/themes/prism.css";
import "prismjs/themes/prism-dark.css";

import CopySvg from "@/assets/icons/copy.svg";
import PasteSvg from "@/assets/icons/paste.svg";
// import "styles/code.css";
const SyntaxHighlighter = Prism;
interface CodeProps {
  children: string;
  language: string;
  isDark?: boolean;
}

export const Code: React.FC<CodeProps> = ({ children, language, isDark = false }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState("");
  // 使用 Clipboard API 进行复制
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    } catch (err) {
      // 降级到传统方法
      fallbackCopyTextToClipboard(children);
    }
  };

  // 降级复制方法（兼容旧浏览器）
  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1000);
      }
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
  };

  // 高亮代码
  useEffect(() => {
    if (children && language) {
      const highlighted = SyntaxHighlighter.highlight(children, SyntaxHighlighter.languages[language] || SyntaxHighlighter.languages.javascript, language);
      setHighlightedCode(highlighted);
    }
  }, [children, language]);

  return (
    <div className={`code ${isDark ? 'code--dark' : 'code--light'}`}>
      <div className="code__icons">
        <button onClick={copyToClipboard} title={isCopied ? "Copied!" : "Copy to Clipboard"}>
          {isCopied ? (
            <span title="Copied!">
              <PasteSvg />
            </span>
          ) : (
            <span title="Copy to Clipboard">
              <CopySvg />
            </span>
          )}
        </button>
      </div>
      <pre className={`language-${language}`}>
        <code
          className={`language-${language}`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
};