import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import {
  materialDark,
  materialLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

import { ReactComponent as CopySvg } from "assets/icons/copy.svg";
import { ReactComponent as PasteSvg } from "assets/icons/paste.svg";
import { ReactComponent as SunSvg } from "assets/icons/sun.svg";
import { ReactComponent as MoonSvg } from "assets/icons/moon.svg";
import "styles/code.css";

export const Code = ({ children, language, isDark, setIsDark }: any) => {
  const [isCopied, setIsCopied] = useState(false);

  SyntaxHighlighter.registerLanguage("jsx", jsx);

  const setCopied = () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return (
    <div className="code">
      <div className="code__icons">
        <button onClick={() => setIsDark(!isDark)}>
          {isDark ? <MoonSvg /> : <SunSvg />}
        </button>

        <CopyToClipboard text={children}>
          <button onClick={() => setCopied()}>
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
        </CopyToClipboard>
      </div>

      <SyntaxHighlighter
        language={language}
        style={isDark ? materialDark : materialLight}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};
