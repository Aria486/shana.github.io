import React, { useState, useEffect } from "react";
import Prism from "prismjs";
// 导入需要的语言
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";

import CopySvg from "@/assets/icons/copy.svg";
import PasteSvg from "@/assets/icons/paste.svg";
import "./style.scss";

const SyntaxHighlighter = Prism;

interface CodeProps {
  children: string | React.ReactNode;
  language: string;
  isDark?: boolean;
}

export const Code: React.FC<CodeProps> = ({ children, language, isDark = false }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState("");

  // 确保 children 是字符串
  const codeText = typeof children === 'string' ? children : String(children || '');

  // 使用 Clipboard API 进行复制
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    } catch (err) {
      fallbackCopyTextToClipboard(codeText);
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
    if (codeText && language) {
      try {
        // 处理语言别名
        let prismLanguage = language;
        if (language === 'shell' || language === 'sh') {
          prismLanguage = 'bash';
        }

        // 检查语言是否被支持
        const grammar = SyntaxHighlighter.languages[prismLanguage] || SyntaxHighlighter.languages.javascript;
        const highlighted = SyntaxHighlighter.highlight(codeText, grammar, prismLanguage);
        setHighlightedCode(highlighted);
      } catch (error) {
        setHighlightedCode(codeText);
      }
    } else {
      setHighlightedCode(codeText);
    }
  }, [codeText, language]);


  return (
    <div className={`shana-blog-code-block ${isDark ? 'dark' : 'light'}`}>
      <div className="code-header">
        <span className="language-label">
          {language}
        </span>
        <button
          className={`copy-button ${isCopied ? 'copied' : ''}`}
          onClick={copyToClipboard}
          title={isCopied ? "Copied!" : "Copy to Clipboard"}
        >
          {isCopied ? (
            <>
              <PasteSvg />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <CopySvg />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre>
        <code
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
};
