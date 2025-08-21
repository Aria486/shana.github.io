import React, { useState, useEffect } from "react";
import Prism from "prismjs";
// 导入你需要的语言
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";

import CopySvg from "@/assets/icons/copy.svg";
import PasteSvg from "@/assets/icons/paste.svg";

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
        console.error('Syntax highlighting error:', error);
        setHighlightedCode(codeText);
      }
    } else {
      setHighlightedCode(codeText);
    }
  }, [codeText, language]);

  const codeBlockStyle: React.CSSProperties = {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '24px',
    boxShadow: isDark
      ? '0 4px 12px rgba(0, 0, 0, 0.4)'
      : '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: isDark
      ? '1px solid rgba(255, 255, 255, 0.1)'
      : '1px solid rgba(0, 0, 0, 0.06)',
    background: isDark
      ? 'linear-gradient(135deg, #1e1e1e 0%, #252526 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: isDark
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.03)',
    borderBottom: isDark
      ? '1px solid rgba(255, 255, 255, 0.1)'
      : '1px solid rgba(0, 0, 0, 0.06)',
    fontSize: '12px',
    fontWeight: '500',
    color: isDark ? '#8B949E' : '#6B7280',
  };

  const copyButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: isDark ? '#8B949E' : '#6B7280',
    transition: 'all 0.2s ease',
    backgroundColor: isCopied
      ? (isDark ? 'rgba(46, 160, 67, 0.15)' : 'rgba(34, 197, 94, 0.1)')
      : 'transparent',
  };

  const preStyle: React.CSSProperties = {
    margin: 0,
    padding: '20px',
    fontSize: '14px',
    lineHeight: '1.6',
    fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',
    background: 'transparent',
    overflow: 'auto',
    color: isDark ? '#E6EDF3' : '#24292F',
  };

  // 自定义语法高亮样式
  const syntaxStyles: React.CSSProperties = isDark ? {
    // 深色主题样式
    '--token-comment': '#7C7C7C',
    '--token-keyword': '#569CD6',
    '--token-string': '#CE9178',
    '--token-number': '#B5CEA8',
    '--token-operator': '#D4D4D4',
    '--token-punctuation': '#D4D4D4',
    '--token-function': '#DCDCAA',
    '--token-class-name': '#4EC9B0',
    '--token-property': '#9CDCFE',
    '--token-boolean': '#569CD6',
    '--token-variable': '#9CDCFE',
    '--token-constant': '#4FC1FF',
    '--token-selector': '#D7BA7D',
    '--token-important': '#C586C0',
    '--token-atrule': '#C586C0',
    '--token-regex': '#D16969',
    '--token-builtin': '#4EC9B0',
  } as React.CSSProperties : {
    // 浅色主题样式
    '--token-comment': '#6A737D',
    '--token-keyword': '#D73A49',
    '--token-string': '#032F62',
    '--token-number': '#005CC5',
    '--token-operator': '#24292E',
    '--token-punctuation': '#24292E',
    '--token-function': '#6F42C1',
    '--token-class-name': '#22863A',
    '--token-property': '#005CC5',
    '--token-boolean': '#005CC5',
    '--token-variable': '#E36209',
    '--token-constant': '#005CC5',
    '--token-selector': '#6F42C1',
    '--token-important': '#D73A49',
    '--token-atrule': '#D73A49',
    '--token-regex': '#032F62',
    '--token-builtin': '#22863A',
  } as React.CSSProperties;

  return (
    <>
      <style>
        {`
          .modern-code-block .token.comment,
          .modern-code-block .token.prolog,
          .modern-code-block .token.doctype,
          .modern-code-block .token.cdata {
            color: var(--token-comment);
            font-style: italic;
          }

          .modern-code-block .token.keyword,
          .modern-code-block .token.tag,
          .modern-code-block .token.attr-name {
            color: var(--token-keyword);
            font-weight: bold;
          }

          .modern-code-block .token.string,
          .modern-code-block .token.attr-value {
            color: var(--token-string);
          }

          .modern-code-block .token.number {
            color: var(--token-number);
          }

          .modern-code-block .token.operator,
          .modern-code-block .token.entity,
          .modern-code-block .token.url {
            color: var(--token-operator);
          }

          .modern-code-block .token.punctuation {
            color: var(--token-punctuation);
          }

          .modern-code-block .token.function {
            color: var(--token-function);
            font-weight: bold;
          }

          .modern-code-block .token.class-name {
            color: var(--token-class-name);
            font-weight: bold;
          }

          .modern-code-block .token.property {
            color: var(--token-property);
          }

          .modern-code-block .token.boolean,
          .modern-code-block .token.constant {
            color: var(--token-boolean);
            font-weight: bold;
          }

          .modern-code-block .token.variable {
            color: var(--token-variable);
          }

          .modern-code-block .token.selector {
            color: var(--token-selector);
            font-weight: bold;
          }

          .modern-code-block .token.important,
          .modern-code-block .token.atrule {
            color: var(--token-important);
            font-weight: bold;
          }

          .modern-code-block .token.regex {
            color: var(--token-regex);
          }

          .modern-code-block .token.builtin {
            color: var(--token-builtin);
          }

          .modern-code-block .copy-button:hover {
            background-color: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'} !important;
          }

          .modern-code-block pre::-webkit-scrollbar {
            height: 8px;
          }

          .modern-code-block pre::-webkit-scrollbar-track {
            background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
            border-radius: 4px;
          }

          .modern-code-block pre::-webkit-scrollbar-thumb {
            background: ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
            border-radius: 4px;
          }

          .modern-code-block pre::-webkit-scrollbar-thumb:hover {
            background: ${isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
          }
        `}
      </style>
      <div className="modern-code-block" style={{ ...codeBlockStyle, ...syntaxStyles }}>
        <div style={headerStyle}>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {language}
          </span>
          <button
            className="copy-button"
            onClick={copyToClipboard}
            style={copyButtonStyle}
            title={isCopied ? "Copied!" : "Copy to Clipboard"}
          >
            {isCopied ? (
              <>
                <PasteSvg style={{ width: '14px', height: '14px' }} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <CopySvg style={{ width: '14px', height: '14px' }} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <pre style={preStyle}>
          <code
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </>
  );
};
