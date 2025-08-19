import React, { useState } from 'react';
import CopyToClipboard from '@uiw/react-copy-to-clipboard';

interface CodeBlockProps {
  children: string;
  language?: string;
  isDark?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  language = 'text',
  isDark = false
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="code-block"
      style={{
        margin: '1rem 0',
        borderRadius: '8px',
        overflow: 'hidden',
        border: isDark ? '1px solid #30363d' : '1px solid #e1e4e8',
        background: isDark ? '#0d1117' : '#ffffff'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem 1rem',
          background: isDark ? '#161b22' : '#f6f8fa',
          borderBottom: isDark ? '1px solid #30363d' : '1px solid #e1e4e8'
        }}
      >
        <span
          style={{
            fontSize: '0.8rem',
            color: isDark ? '#8b949e' : '#586069',
            fontWeight: 500
          }}
        >
          {language}
        </span>
        <CopyToClipboard text={children} onCopy={handleCopy}>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              color: isDark ? '#8b949e' : '#586069',
              transition: 'all 0.2s'
            }}
            title={copied ? '已复制!' : '复制代码'}
            onMouseOver={(e) => {
              e.currentTarget.style.background = isDark ? '#30363d' : '#e1e4e8';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            {copied ? '✓ 已复制' : '📋 复制'}
          </button>
        </CopyToClipboard>
      </div>
      <pre
        style={{
          margin: 0,
          padding: '1rem',
          background: isDark ? '#0d1117' : '#ffffff',
          overflowX: 'auto',
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          fontSize: '14px',
          lineHeight: '1.45',
          color: isDark ? '#e6edf3' : '#24292f'
        }}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
};